import requests as py_requests
from html import escape as escape_html
import secrets
import datetime
import hashlib
import logging
import re
import os
import hmac
import uuid
import io
import json
from decimal import Decimal, InvalidOperation
from functools import wraps
import qrcode
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from flask import Blueprint, jsonify, request, current_app, send_file
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from PIL import Image, ImageOps, UnidentifiedImageError
from werkzeug.security import generate_password_hash

from .models import db, FuneralService, User, AuthChallenge, UploadedFile, Eulogy, Consultation, Product, ProductImage, ProductSpecification, ProductReview, Order, OrderItem, PaymentTransaction, MpesaCallbackEvent, Memorial, JournalEntry, GalleryImage, MemorialCandle, FamilyTreeMember
from .mpesa import generate_stk_push_payload
from . import limiter
from .storage import put_image, delete_object
from .services.chat_service import (
    MAX_MESSAGE_CHARS,
    ChatServiceError,
    generate_chat_reply,
    is_chat_configured,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api = Blueprint("api", __name__)


def send_mail_message(msg, mail_instance=None):
    from . import mail as default_mail

    mail_instance = mail_instance or default_mail

    if current_app.config.get("MAIL_SUPPRESS_SEND"):
        logger.info("Email delivery skipped because MAIL_SUPPRESS_SEND is enabled.")
        return True

    if not current_app.config.get("MAIL_USERNAME") or not current_app.config.get("MAIL_PASSWORD"):
        logger.warning("Email delivery skipped because mail credentials are not configured.")
        return False
    try:
        mail_instance.send(msg)
        return True
    except Exception as exc:
        logger.exception("Email delivery failed")
        logger.error(str(exc))
        return False


AUTH_CODE_TTL_MINUTES = 10
AUTH_CODE_MAX_ATTEMPTS = 5
AUTH_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _auth_code_digest(user_id, purpose, code):
    key = str(current_app.config["JWT_SECRET_KEY"]).encode("utf-8")
    value = f"{user_id}:{purpose}:{code}".encode("utf-8")
    return hmac.new(key, value, hashlib.sha256).hexdigest()


def _send_auth_code(user, purpose):
    """Replace an old code and email a new code. Raw codes are never stored."""
    from flask_mail import Message
    from . import mail

    if not _email_delivery_configured():
        logger.error("Auth code email was not sent because email delivery is not configured.")
        return False

    AuthChallenge.query.filter_by(user_id=user.id, purpose=purpose).delete(synchronize_session=False)
    user.otp_code = None
    user.otp_expires = None
    code = f"{secrets.randbelow(1_000_000):06d}"
    challenge = AuthChallenge(
        user_id=user.id,
        purpose=purpose,
        code_hash=_auth_code_digest(user.id, purpose, code),
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(minutes=AUTH_CODE_TTL_MINUTES),
    )
    db.session.add(challenge)
    db.session.commit()

    action = "verify your email address" if purpose == "verify" else "reset your password"
    msg = Message(
        subject=("Verify your email" if purpose == "verify" else "Reset your password") + " | Last Planner Julz",
        sender=("Last Planner Julz Funeral Planning Hub", current_app.config.get("MAIL_USERNAME")),
        recipients=[user.email],
    )
    msg.body = f"Use this code to {action}: {code}. It expires in {AUTH_CODE_TTL_MINUTES} minutes. If you did not request this, ignore this email."
    msg.html = f"""
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:24px auto;padding:32px;background:#fff;border:1px solid #E8DFD1;border-radius:10px;color:#3D3530">
        <h1 style="font-size:22px;color:#1F2E27">Last Planner Julz</h1>
        <p>Use this one-time code to {escape_html(action)}:</p>
        <p style="padding:18px;background:#F8F6F0;text-align:center;font-size:32px;letter-spacing:8px;color:#A8895C"><strong>{code}</strong></p>
        <p>This code expires in {AUTH_CODE_TTL_MINUTES} minutes and can be used once.</p>
        <p>If you did not request this code, you can ignore this email.</p>
      </div>
    """
    try:
        if current_app.config.get("MAIL_SUPPRESS_SEND") and not current_app.testing:
            logger.error("Auth code email was not sent because MAIL_SUPPRESS_SEND is enabled.")
            sent = False
        else:
            sent = send_mail_message(msg, mail)
    except Exception:
        logger.exception("Could not send %s code to %s", purpose, user.email)
        sent = False

    if not sent:
        db.session.delete(challenge)
        db.session.commit()
        return False
    return True


def _consume_auth_code(user, purpose, code):
    challenge = AuthChallenge.query.filter_by(user_id=user.id, purpose=purpose).order_by(AuthChallenge.created_at.desc()).first()
    if not challenge:
        return False
    now = datetime.datetime.utcnow()
    if challenge.expires_at <= now or challenge.attempts >= AUTH_CODE_MAX_ATTEMPTS:
        db.session.delete(challenge)
        db.session.commit()
        return False

    expected = _auth_code_digest(user.id, purpose, code)
    if not hmac.compare_digest(challenge.code_hash, expected):
        challenge.attempts += 1
        db.session.commit()
        return False

    db.session.delete(challenge)
    db.session.commit()
    return True


def _password_validation_error(password):
    if not isinstance(password, str) or len(password) < 8:
        return "Password must be at least 8 characters long."
    if len(password.encode("utf-8")) > 72:
        return "Password must be 72 bytes or fewer."
    return ""


def _normalized_email(payload):
    value = payload.get("email", "") if isinstance(payload, dict) else ""
    return value.strip().lower() if isinstance(value, str) else ""


def _json_payload():
    payload = request.get_json(silent=True)
    return payload if isinstance(payload, dict) else {}


def _email_delivery_configured():
    return bool((current_app.testing and current_app.config.get("MAIL_SUPPRESS_SEND")) or (
        current_app.config.get("MAIL_USERNAME") and current_app.config.get("MAIL_PASSWORD")
    ))

# --- SECURITY MIDDLEWARE ---

def rate_limit(max_requests=5, window_seconds=60):
    return limiter.limit(f"{max_requests} per {window_seconds} seconds")

def require_safaricom_ip(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_app.config.get('DEBUG'):
            return f(*args, **kwargs)

        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            client_ip = forwarded_for.split(',')[0].strip()
        else:
            client_ip = request.remote_addr

        if client_ip and not client_ip.startswith("196.201.") and client_ip not in ["127.0.0.1", "::1"]:
            logger.warning(f"BLOCKED: Unauthorized Webhook Attempt from IP: {client_ip}")
            return jsonify({"ResultCode": 1, "ResultDesc": "Unauthorized origin"}), 403

        return f(*args, **kwargs)
    return decorated_function

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user or not user.is_admin:
            return jsonify({"error": "Admin access required for this action."}), 403
        return fn(*args, **kwargs)
    return wrapper

# ==========================================
# --- EULOGY PDF & QR CODE ENGINE ---
# ==========================================

def generate_qr_code(memorial_url):
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
    qr.add_data(memorial_url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1F2E27", back_color="white")

    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)
    return img_byte_arr.getvalue()

def generate_eulogy_pdf(eulogy, memorial_url):
    raw_text = eulogy.personality or ""
    metadata = {}
    story_text = raw_text

    match = re.search(r'\[PRODUCTION METADATA\](.*?)\[/PRODUCTION METADATA\]', raw_text, re.DOTALL)
    if match:
        meta_block = match.group(1)
        for line in meta_block.strip().split('\n'):
            if ':' in line:
                key, val = line.split(':', 1)
                metadata[key.strip()] = val.strip()
        story_text = raw_text.replace(match.group(0), '').strip()

    template_name = metadata.get("Template", "Executive Minimal")
    themes = {
        "Executive Minimal": {"bg": "#F8F6F0", "text": "#1F2E27", "accent": "#A8895C"},
        "Blue Rose Border": {"bg": "#E8F0F8", "text": "#172A3A", "accent": "#4A90E2"},
        "Dark Golden Flora": {"bg": "#1F2E27", "text": "#F8F6F0", "accent": "#D4AF37"},
        "Classic Parchment": {"bg": "#F4ECD8", "text": "#3D3530", "accent": "#8F744D"}
    }
    theme = themes.get(template_name, themes["Executive Minimal"])

    font_name = metadata.get("Font", "Classic Serif")
    base_font, base_font_bold, base_font_italic = "Times-Roman", "Times-Bold", "Times-Italic"

    if "Modern" in font_name:
        base_font, base_font_bold, base_font_italic = "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"
    elif "Typewriter" in font_name:
        base_font, base_font_bold, base_font_italic = "Courier", "Courier-Bold", "Courier-Oblique"

    font_size = int(metadata.get("Size", "16").replace("px", ""))
    pdf_font_size = max(10, min(16, font_size * 0.75))

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)

    def paint_background(canvas, doc):
        canvas.saveState()
        canvas.setFillColorHex(theme["bg"])
        canvas.rect(0, 0, letter[0], letter[1], fill=True, stroke=False)
        canvas.restoreState()

    styles = getSampleStyleSheet()

    cover_title = ParagraphStyle('CoverTitle', fontName=base_font_bold, fontSize=32, leading=38, textColor=colors.HexColor(theme["text"]), alignment=TA_CENTER, spaceAfter=20)
    cover_subtitle = ParagraphStyle('CoverSubtitle', fontName=base_font_italic, fontSize=12, textColor=colors.HexColor(theme["accent"]), alignment=TA_CENTER, spaceAfter=30, textTransform='uppercase')
    cover_dates = ParagraphStyle('CoverDates', fontName=base_font_bold, fontSize=12, textColor=colors.HexColor(theme["text"]), alignment=TA_CENTER, spaceAfter=50)

    chapter_title = ParagraphStyle('ChapterTitle', fontName=base_font_bold, fontSize=pdf_font_size + 4, textColor=colors.HexColor(theme["text"]), alignment=TA_LEFT, spaceAfter=10, textTransform='uppercase')
    body_text = ParagraphStyle('BodyText', fontName=base_font, fontSize=pdf_font_size, leading=pdf_font_size * 1.6, textColor=colors.HexColor(theme["text"]), alignment=TA_LEFT, spaceAfter=15)

    story = []

    story.append(Spacer(1, 120))
    story.append(Paragraph("In Loving Memory Of", cover_subtitle))
    story.append(Paragraph(eulogy.deceased_name, cover_title))

    story.append(Paragraph(f"<font color='{theme['accent']}'>________________________</font>", cover_dates))

    dates_text = f"{eulogy.birth_year[:4] if eulogy.birth_year else 'YYYY'} — {eulogy.passing_year[:4] if eulogy.passing_year else 'YYYY'}"
    story.append(Paragraph(dates_text, cover_dates))

    story.append(PageBreak())

    chapters = re.split(r'([A-Z\s&]+):', story_text)

    for i in range(1, len(chapters), 2):
        chap_heading = chapters[i].strip()
        chap_content = chapters[i+1].strip() if i+1 < len(chapters) else ""

        if chap_heading and chap_content:
            story.append(Paragraph(chap_heading, chapter_title))

            for p in chap_content.split('\n'):
                if p.strip():
                    story.append(Paragraph(p.strip().replace('<', '&lt;').replace('>', '&gt;'), body_text))

            story.append(Spacer(1, 20))

    story.append(Spacer(1, 30))
    story.append(Paragraph(f"<font color='{theme['accent']}'>________________________</font>", cover_dates))
    story.append(Paragraph("Digital Memorial Space", chapter_title))
    story.append(Paragraph("Scan the code below with your mobile device to visit the interactive digital tribute, view memories, and leave your condolences.", body_text))

    qr_bytes = generate_qr_code(memorial_url)
    qr_buffer = io.BytesIO(qr_bytes)
    story.append(RLImage(qr_buffer, width=120, height=120))

    doc.build(story, onFirstPage=paint_background, onLaterPages=paint_background)
    buffer.seek(0)
    return buffer.getvalue()

def send_eulogy_email(eulogy, memorial_url, mail_instance):
    from flask_mail import Message
    try:
        if not eulogy.recipient_email:
            logger.warning("Skipping eulogy email because no recipient address was supplied.")
            return

        msg = Message(
            subject=f"Digital Eulogy & QR Code - In Memory of {eulogy.deceased_name}",
            sender=("Last Planner Julz Funeral Planning Hub", current_app.config.get('MAIL_USERNAME')),
            recipients=[eulogy.recipient_email]
        )

        msg.body = f"""Dear Family & Friends,

Thank you for trusting Last Planner Julz with honoring {eulogy.deceased_name}.

Your M-Pesa payment has been verified successfully.

ATTACHED TO THIS EMAIL:
1. Eulogy_Document.pdf - The complete formatted memorial eulogy.
2. Memorial_QRCode.png - Unique QR code for printing on funeral programs, cards, or headstones.

Digital Memorial Link:
{memorial_url}

When attendees scan the attached QR code with their mobile phones, they will instantly be taken to this online tribute.

"With you when you need us the most."

Warm regards,
Last Planner Julz Funeral Home
"""
        qr_bytes = generate_qr_code(memorial_url)
        pdf_bytes = generate_eulogy_pdf(eulogy, memorial_url)

        msg.attach("Memorial_QRCode.png", "image/png", qr_bytes)
        msg.attach(f"{eulogy.deceased_name.replace(' ', '_')}_Eulogy.pdf", "application/pdf", pdf_bytes)

        success = send_mail_message(msg, mail_instance)
        if success:
            logger.info(f"[SUCCESS] Eulogy assets emailed to {eulogy.recipient_email}")
        else:
            logger.warning(f"[WARN] Eulogy email delivery skipped or failed for {eulogy.recipient_email}")
    except Exception as e:
        logger.error(f"[ERROR] Eulogy email delivery failed: {str(e)}")
        return False
    return True


# --- AUTHENTICATION ROUTES ---

@api.route("/api/auth/register", methods=["POST"])
@rate_limit(max_requests=5, window_seconds=60)
def register():
    payload = _json_payload()
    email = _normalized_email(payload)
    password = payload.get("password") or ""

    if not AUTH_EMAIL_RE.match(email):
        return jsonify({"message": "Please provide a valid email address."}), 400

    password_error = _password_validation_error(password)
    if password_error:
        return jsonify({"message": password_error}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user and existing_user.is_verified:
        return jsonify({"message": "An account with this email already exists. Please sign in instead."}), 409

    if existing_user:
        new_user = existing_user
        new_user.set_password(password)
    else:
        new_user = User(email=email)
        new_user.set_password(password)
        new_user.is_verified = False
        db.session.add(new_user)
        db.session.commit()

    sent = _send_auth_code(new_user, "verify")
    if not sent:
        return jsonify({
            "message": "Your account is saved, but we could not send the verification email. Please try resending the code shortly.",
            "verification_sent": False,
        }), 202
    return jsonify({"message": "Account created. Check your email for a verification code.", "verification_sent": True}), 201


@api.route("/api/auth/login", methods=["POST"])
@rate_limit(max_requests=10, window_seconds=60)
def login():
    payload = _json_payload()
    email = _normalized_email(payload)
    password = payload.get("password") or ""

    if not isinstance(password, str) or len(password.encode("utf-8")) > 72:
        return jsonify({"message": "Invalid email or password."}), 401
    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        if not user.is_verified:
            return jsonify({"message": "Please verify your email address before signing in. You can request a new verification code."}), 403
        token = create_access_token(identity=str(user.id))
        return jsonify({
            "token": token,
            "email": user.email,
            "is_verified": bool(user.is_verified),
            "is_admin": bool(user.is_admin)
        }), 200

    return jsonify({"message": "Invalid email or password"}), 401


@api.route("/api/auth/google", methods=["POST"])
def google_login():
    payload = _json_payload()
    access_token = payload.get("token")

    if not access_token:
        return jsonify({"message": "No Google authentication token provided."}), 400

    try:
        google_response = py_requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=8,
        )
    except py_requests.RequestException:
        logger.exception("Google identity lookup failed")
        return jsonify({"message": "Google sign-in is temporarily unavailable. Please try again."}), 502

    if not google_response.ok:
        return jsonify({"message": "Invalid or expired Google token."}), 401

    google_user = google_response.json()
    email = (google_user.get("email") or "").strip().lower()

    if not email:
        return jsonify({"message": "No email address associated with this Google account."}), 400
    if not google_user.get("email_verified"):
        return jsonify({"message": "Please use a Google account with a verified email address."}), 403

    user = User.query.filter_by(email=email).first()

    if not user:
        user = User(email=email)
        user.set_password(secrets.token_urlsafe(32))
        user.is_verified = True
        db.session.add(user)
        db.session.commit()
    elif not user.is_verified:
        user.is_verified = True
        AuthChallenge.query.filter_by(user_id=user.id, purpose="verify").delete(synchronize_session=False)
        db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "email": user.email,
        "is_verified": user.is_verified,
        "is_admin": bool(user.is_admin)
    }), 200


@api.route("/api/auth/facebook", methods=["POST"])
def facebook_login():
    payload = _json_payload()
    access_token = payload.get("token")

    if not access_token:
        return jsonify({"message": "No Facebook authentication token provided."}), 400

    try:
        fb_response = py_requests.get(
            "https://graph.facebook.com/me?fields=id,name,email",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=8,
        )
    except py_requests.RequestException:
        logger.exception("Facebook identity lookup failed")
        return jsonify({"message": "Facebook sign-in is temporarily unavailable. Please try again."}), 502

    if not fb_response.ok:
        return jsonify({"message": "Invalid or expired Facebook token."}), 401

    fb_user = fb_response.json()
    email = (fb_user.get("email") or "").strip().lower()

    if not email:
        return jsonify({"message": "Your Facebook account does not have a public email address. Please use standard registration."}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        user = User(email=email)
        user.set_password(secrets.token_urlsafe(32))
        user.is_verified = True
        db.session.add(user)
        db.session.commit()
    elif not user.is_verified:
        user.is_verified = True
        AuthChallenge.query.filter_by(user_id=user.id, purpose="verify").delete(synchronize_session=False)
        db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "email": user.email,
        "is_verified": user.is_verified,
        "is_admin": bool(user.is_admin)
    }), 200


@api.route("/api/auth/twitter", methods=["POST"])
def twitter_login():
    payload = _json_payload()

    auth_code = payload.get("code")
    client_id = payload.get("client_id")
    redirect_uri = payload.get("redirect_uri")
    code_verifier = payload.get("code_verifier")

    if not auth_code or not client_id or not redirect_uri or not code_verifier:
        return jsonify({"message": "Missing X/Twitter authorization data."}), 400

    token_url = "https://api.twitter.com/2/oauth2/token"
    data = {
        "code": auth_code,
        "grant_type": "authorization_code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "code_verifier": code_verifier
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    try:
        token_res = py_requests.post(token_url, data=data, headers=headers, timeout=8)
    except py_requests.RequestException:
        logger.exception("X token exchange failed")
        return jsonify({"message": "X sign-in is temporarily unavailable. Please try again."}), 502

    if not token_res.ok:
        return jsonify({"message": "Invalid or expired X/Twitter authorization code."}), 401

    access_token = token_res.json().get("access_token")

    user_headers = {"Authorization": f"Bearer {access_token}"}
    try:
        twitter_response = py_requests.get("https://api.twitter.com/2/users/me?user.fields=email", headers=user_headers, timeout=8)
    except py_requests.RequestException:
        logger.exception("X identity lookup failed")
        return jsonify({"message": "X sign-in is temporarily unavailable. Please try again."}), 502

    if not twitter_response.ok:
        return jsonify({"message": "Failed to fetch user profile from X/Twitter."}), 401

    twitter_user = twitter_response.json().get("data", {})
    email = (twitter_user.get("email") or "").strip().lower()

    if not email:
        return jsonify({"message": "Your X account does not have a public email address. Please use standard registration."}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        user = User(email=email)
        user.set_password(secrets.token_urlsafe(32))
        user.is_verified = True
        db.session.add(user)
        db.session.commit()
    elif not user.is_verified:
        user.is_verified = True
        AuthChallenge.query.filter_by(user_id=user.id, purpose="verify").delete(synchronize_session=False)
        db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "token": token,
        "email": user.email,
        "is_verified": user.is_verified,
        "is_admin": bool(user.is_admin)
    }), 200


@api.route("/api/auth/send-otp", methods=["POST"])
@rate_limit(max_requests=5, window_seconds=60)
def send_otp():
    payload = _json_payload()
    email = _normalized_email(payload)
    purpose = payload.get("purpose", "verify")

    if not AUTH_EMAIL_RE.match(email):
        return jsonify({"message": "Please provide a valid email address."}), 400
    if not isinstance(purpose, str) or purpose not in {"verify", "reset"}:
        return jsonify({"message": "Invalid code request."}), 400

    if not _email_delivery_configured():
        return jsonify({"message": "Email delivery is not configured. Please contact support or try again later."}), 503

    user = User.query.filter_by(email=email).first()
    if purpose == "reset":
        # Keep password-reset requests indistinguishable for existing and unknown addresses.
        if user and user.is_verified:
            _send_auth_code(user, "reset")
        return jsonify({"message": "If an account exists for this email, a password reset code will be sent."}), 202

    if not user:
        return jsonify({"message": "We could not find a pending account for this email. Please register first."}), 404
    if user.is_verified:
        return jsonify({"message": "This email is already verified. Please sign in."}), 409
    if not _send_auth_code(user, "verify"):
        return jsonify({"message": "We could not send the verification email. Please try again shortly."}), 503
    return jsonify({"message": "A new verification code has been sent."}), 200


@api.route("/api/auth/verify-otp", methods=["POST"])
@rate_limit(max_requests=10, window_seconds=60)
def verify_otp():
    payload = _json_payload()
    email = _normalized_email(payload)
    raw_code = payload.get("code", "")
    code = raw_code.strip() if isinstance(raw_code, str) else ""

    if not AUTH_EMAIL_RE.match(email) or not re.fullmatch(r"\d{6}", code):
        return jsonify({"message": "Enter a valid email address and 6-digit code."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "The code is invalid or expired. Request a new code and try again."}), 400
    if user.is_verified:
        return jsonify({"message": "This email is already verified. Please sign in."}), 409

    if _consume_auth_code(user, "verify", code):
        user.is_verified = True
        db.session.commit()
        return jsonify({"message": "Email verified successfully."}), 200
    return jsonify({"message": "The code is invalid or expired. Request a new code and try again."}), 400


@api.route("/api/auth/reset-password", methods=["POST"])
@rate_limit(max_requests=5, window_seconds=60)
def reset_password():
    payload = _json_payload()
    email = _normalized_email(payload)
    raw_code = payload.get("code", "")
    code = raw_code.strip() if isinstance(raw_code, str) else ""
    new_password = payload.get("new_password") or ""

    password_error = _password_validation_error(new_password)
    if password_error:
        return jsonify({"message": password_error}), 400
    if not AUTH_EMAIL_RE.match(email) or not re.fullmatch(r"\d{6}", code):
        return jsonify({"message": "The code is invalid or expired. Request a new code and try again."}), 400

    user = User.query.filter_by(email=email).first()
    if user and user.is_verified and _consume_auth_code(user, "reset", code):
        user.set_password(new_password)
        db.session.commit()
        return jsonify({"message": "Password reset successfully."}), 200
    return jsonify({"message": "The code is invalid or expired. Request a new code and try again."}), 400


# ==========================================
# --- MEMORIAL HUB API ROUTES ---
# ==========================================

@api.route("/api/memorials", methods=["POST"])
def create_memorial():
    payload = request.get_json() or {}
    general_pin = payload.get("pin")
    nuclear_pin = payload.get("familyTreePin")
    security_answer = payload.get("securityAnswer", "")
    if not all(isinstance(value, str) and value.strip() for value in (general_pin, nuclear_pin, security_answer)):
        return jsonify({"error": "Memorial PINs and a security answer are required."}), 400
    new_memorial = Memorial(
        id=payload.get("id"),
        name=payload.get("name"),
        general_pin_hash=generate_password_hash(general_pin.strip()),
        nuclear_pin_hash=generate_password_hash(nuclear_pin.strip()),
        donation_number=payload.get("donationNumber"),
        portrait_url=payload.get("portrait"),
        security_question=payload.get("securityQuestion"),
        security_answer_hash=generate_password_hash(security_answer.strip().lower())
    )
    db.session.add(new_memorial)
    db.session.commit()
    return jsonify({"message": "Memorial created successfully", "memorial": new_memorial.to_dict()}), 201

@api.route("/api/memorials/<memorial_id>", methods=["GET"])
def get_memorial(memorial_id):
    memorial = Memorial.query.get_or_404(memorial_id)
    return jsonify(memorial.to_dict()), 200


# --- EULOGY ROUTES ---

@api.route("/api/eulogies", methods=["POST"])
@jwt_required()
def create_eulogy():
    user_id = get_jwt_identity()
    payload = request.get_json() or {}

    try:
        user = User.query.get(user_id)

        latest_tx = PaymentTransaction.query.filter_by(email=user.email).order_by(PaymentTransaction.created_at.desc()).first()
        checkout_id = latest_tx.checkout_request_id if latest_tx else None

        new_eulogy = Eulogy(
            deceased_name=payload.get("deceased_name"),
            birth_year=payload.get("birth_year"),
            passing_year=payload.get("passing_year"),
            occupation=payload.get("occupation"),
            interests=payload.get("interests"),
            personality=payload.get("personality"),
            recipient_email=payload.get("recipient_email"),
            template_id=payload.get("template_id"),
            payment_status=payload.get("payment_status", "pending"),
            checkout_request_id=checkout_id,
            user_id=user_id
        )

        db.session.add(new_eulogy)
        db.session.commit()

        return jsonify({
            "message": "Eulogy saved successfully!",
            "eulogy_id": new_eulogy.id
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@api.route("/api/eulogies/<eulogy_id>", methods=["GET"])
def get_public_eulogy(eulogy_id):
    eulogy = Eulogy.query.get(eulogy_id)
    if not eulogy:
        return jsonify({"error": "Eulogy not found"}), 404
    return jsonify(eulogy.to_dict()), 200


# --- NEW: DIRECT PDF DOWNLOAD ENDPOINT FOR QR SCAN ATTENDEES ---
@api.route("/api/eulogies/<eulogy_id>/download", methods=["GET"])
def download_eulogy_pdf(eulogy_id):
    eulogy = Eulogy.query.get(eulogy_id)
    if not eulogy:
        return jsonify({"error": "Eulogy record not found"}), 404

    try:
        domain = os.getenv('FRONTEND_URL', 'http://localhost:4173')
        memorial_url = f"{domain}/memorial/{eulogy.id}"

        pdf_bytes = generate_eulogy_pdf(eulogy, memorial_url)
        safe_name = secure_filename(eulogy.deceased_name.replace(" ", "_")) or "Memorial"
        filename = f"{safe_name}_Eulogy_Program.pdf"

        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        logger.error(f"[DOWNLOAD ERROR] PDF generation failed for Eulogy #{eulogy_id}: {str(e)}")
        return jsonify({"error": "Failed to build PDF document for download."}), 500


# ==========================================
# --- ENTERPRISE CATALOG API ROUTES ---
# ==========================================

@api.route("/api/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products]), 200

@api.route("/api/products/<int:product_id>", methods=["GET"])
def get_product_detail(product_id):
    product = Product.query.get_or_404(product_id)
    return jsonify(product.to_dict()), 200

@api.route("/api/upload", methods=["POST"])
@rate_limit(max_requests=10, window_seconds=60)
@jwt_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        max_upload_bytes = current_app.config.get('MAX_UPLOAD_BYTES', 8 * 1024 * 1024)
        file.stream.seek(0, os.SEEK_END)
        file_size = file.stream.tell()
        file.stream.seek(0)
        if file_size > max_upload_bytes:
            max_size_mb = max_upload_bytes // (1024 * 1024)
            return jsonify({"error": f"Image must be {max_size_mb} MB or smaller."}), 413

        image = Image.open(file.stream)
        if image.format not in {"JPEG", "PNG", "WEBP"}:
            return jsonify({"error": "Upload a JPEG, PNG, or WebP image."}), 400
        max_pixels = current_app.config.get('MAX_UPLOAD_PIXELS', 25_000_000)
        if image.width * image.height > max_pixels:
            return jsonify({"error": "Image dimensions are too large. Please choose a smaller image."}), 413
        image = ImageOps.exif_transpose(image)
        image.thumbnail((3000, 3000))
        if image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGB")
        if image.mode == "RGBA":
            background = Image.new("RGB", image.size, "white")
            background.paste(image, mask=image.getchannel("A"))
            image = background
        filename = f"{uuid.uuid4().hex}.jpg"
        output = io.BytesIO()
        image.save(output, format="JPEG", quality=85, optimize=True)
        payload_bytes = output.getvalue()
        put_image(filename, payload_bytes)
        uploaded_file = UploadedFile(user_id=int(get_jwt_identity()), filename=filename, byte_size=len(payload_bytes))
        db.session.add(uploaded_file)
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            try:
                delete_object(filename)
            except Exception:
                logger.exception("Orphaned private upload requires cleanup")
            logger.exception("Uploaded image metadata could not be saved")
            return jsonify({"error": "The image could not be saved. Please try again."}), 500
        return jsonify({"image_url": f"/static/uploads/{filename}"}), 200
    except RuntimeError as exc:
        logger.error("Private object storage is unavailable: %s", exc)
        return jsonify({"error": "Image uploads are temporarily unavailable."}), 503
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        return jsonify({"error": "That file could not be read as a valid image. Please choose a JPEG, PNG, or WebP."}), 400
    except Exception:
        db.session.rollback()
        logger.exception("Private image upload failed")
        return jsonify({"error": "Image storage is temporarily unavailable."}), 503

@api.route("/api/products/<int:product_id>/reviews", methods=["POST"])
@jwt_required()
def add_review(product_id):
    user_id = get_jwt_identity()
    payload = request.get_json() or {}

    has_purchased = OrderItem.query.join(Order).filter(
        Order.user_id == user_id,
        Order.status == 'completed',
        OrderItem.product_id == product_id
    ).first()

    if not has_purchased:
        return jsonify({"error": "Verified Buyers Only. You must purchase this item before leaving a review."}), 403

    existing_review = ProductReview.query.filter_by(product_id=product_id, user_id=user_id).first()
    if existing_review:
        return jsonify({"error": "You have already reviewed this product."}), 400

    product = Product.query.get_or_404(product_id)

    new_review = ProductReview(
        product_id=product.id,
        user_id=user_id,
        product_rating=int(payload.get("productRating", 5)),
        service_rating=int(payload.get("serviceRating", 5)),
        comment=payload.get("comment", ""),
        image_url=payload.get("image_url", None),
        is_verified_buyer=True
    )

    db.session.add(new_review)
    db.session.commit()

    return jsonify({"message": "Review submitted successfully!", "product": product.to_dict()}), 201


# ==========================================
# --- ADMIN CMS CONTROL ENDPOINTS ---
# ==========================================

@api.route("/api/admin/dashboard-stats", methods=["GET"])
@admin_required
def admin_stats():
    total_users = User.query.count()
    total_orders = Order.query.count()
    revenue = db.session.query(db.func.sum(Order.total_amount)).scalar() or 0.0
    pending_payments = PaymentTransaction.query.filter_by(status='pending').count()
    return jsonify({
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": float(revenue),
        "pending_payments": pending_payments
    }), 200

@api.route("/api/admin/orders", methods=["GET"])
@admin_required
def admin_orders():
    orders = Order.query.order_by(Order.created_at.desc()).limit(50).all()
    return jsonify([o.to_dict() for o in orders]), 200

@api.route("/api/admin/payments", methods=["GET"])
@admin_required
def admin_payments():
    payments = PaymentTransaction.query.order_by(PaymentTransaction.created_at.desc()).limit(50).all()
    return jsonify([p.to_dict() for p in payments]), 200


@api.route("/api/admin/payment-reconciliation", methods=["GET"])
@admin_required
def admin_payment_reconciliation():
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
    events = MpesaCallbackEvent.query.filter(MpesaCallbackEvent.error.isnot(None)).order_by(
        MpesaCallbackEvent.received_at.desc()
    ).limit(100).all()
    stale = PaymentTransaction.query.filter(
        PaymentTransaction.status.in_(["initiated", "pending"]),
        PaymentTransaction.created_at < cutoff,
    ).order_by(PaymentTransaction.created_at.asc()).limit(100).all()
    return jsonify({
        "callback_exceptions": [
            {
                "checkout_request_id": event.checkout_request_id,
                "result_code": event.result_code,
                "reason": event.error,
                "received_at": event.received_at.isoformat(),
            }
            for event in events
        ],
        "stale_transactions": [transaction.to_dict() for transaction in stale],
    }), 200

@api.route("/api/admin/products", methods=["POST"])
@admin_required
def admin_create_product():
    payload = request.get_json() or {}

    inclusions_data = payload.get("inclusions", "")
    if isinstance(inclusions_data, list):
        inclusions_data = ", ".join(inclusions_data)

    new_product = Product(
        category_id=payload.get("category_id", "casket_list"),
        title=payload.get("title"),
        description=payload.get("desc"),
        price=float(payload.get("price", 0)),
        discount_percent=int(payload.get("discount_percent", 0)),
        has_sizes=bool(payload.get("has_sizes", False)),
        inclusions=inclusions_data,
        dispatch_location=payload.get("dispatch_location", "Kahawa West")
    )
    db.session.add(new_product)
    db.session.flush()

    images = payload.get("images", [])
    if not images: images = ["/images/caskets/casket1().jpg"]
    for img_url in images:
        db.session.add(ProductImage(product_id=new_product.id, image_url=img_url))

    db.session.commit()
    return jsonify({"message": "Product created successfully!", "product": new_product.to_dict()}), 201

@api.route("/api/admin/products/<int:product_id>", methods=["PUT"])
@admin_required
def admin_update_product(product_id):
    product = Product.query.get_or_404(product_id)
    payload = request.get_json() or {}

    inclusions_data = payload.get("inclusions", "")
    if isinstance(inclusions_data, list):
        inclusions_data = ", ".join(inclusions_data)

    product.title = payload.get("title", product.title)
    product.description = payload.get("desc", product.description)
    product.price = float(payload.get("price", product.price))
    product.category_id = payload.get("category_id", product.category_id)
    product.discount_percent = int(payload.get("discount_percent", product.discount_percent))
    product.has_sizes = bool(payload.get("has_sizes", product.has_sizes))
    product.inclusions = inclusions_data
    product.dispatch_location = payload.get("dispatch_location", product.dispatch_location)

    if "images" in payload and payload["images"]:
        ProductImage.query.filter_by(product_id=product.id).delete()
        for img_url in payload["images"]:
            db.session.add(ProductImage(product_id=product.id, image_url=img_url))

    db.session.commit()
    return jsonify({"message": "Product updated successfully!", "product": product.to_dict()}), 200

@api.route("/api/admin/products/<int:product_id>", methods=["DELETE"])
@admin_required
def admin_delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully!"}), 200

@api.route("/api/admin/reviews", methods=["GET"])
@admin_required
def admin_get_reviews():
    reviews = ProductReview.query.order_by(ProductReview.created_at.desc()).all()
    return jsonify([r.to_dict() for r in reviews]), 200

@api.route("/api/admin/reviews/<int:review_id>/reply", methods=["POST"])
@admin_required
def admin_reply_review(review_id):
    review = ProductReview.query.get_or_404(review_id)
    payload = request.get_json() or {}

    reply_text = payload.get("reply", "").strip()
    if not reply_text:
        return jsonify({"error": "Reply text cannot be empty."}), 400

    review.admin_reply = reply_text
    review.admin_replied_at = datetime.datetime.utcnow()
    db.session.commit()

    return jsonify({"message": "Reply saved successfully!", "review": review.to_dict()}), 200


# --- PUBLIC ROUTES ---

@api.route("/api/health", methods=["GET"])
def health_check():
    try:
        db.session.execute(db.text("SELECT 1"))
    except Exception:
        db.session.rollback()
        logger.exception("Health check could not reach the database")
        return jsonify({"status": "unavailable", "database": "unavailable"}), 503
    return jsonify({"status": "ok", "database": "ok"}), 200


@api.route("/api/chat/status", methods=["GET"])
def chat_status():
    """Expose only whether the chatbot is configured; never return secrets."""
    return jsonify({"available": is_chat_configured()}), 200


@api.route("/api/chat", methods=["POST"])
@rate_limit(max_requests=10, window_seconds=60)
def chat():
    if request.content_length and request.content_length > 16_384:
        return jsonify({"message": "That message is too large. Please shorten it and try again."}), 413

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"message": "Send your message as JSON."}), 400

    message = payload.get("message")
    if not isinstance(message, str):
        return jsonify({"message": "Please enter a question about the website."}), 400
    if len(message) > MAX_MESSAGE_CHARS:
        return jsonify({"message": f"Please keep your message under {MAX_MESSAGE_CHARS} characters."}), 400
    if not message.strip():
        return jsonify({"message": "Please enter a question about the website."}), 400

    try:
        reply = generate_chat_reply(message, payload.get("history", []))
    except ChatServiceError as exc:
        return jsonify({"message": exc.message}), exc.status_code

    return jsonify({"reply": reply}), 200


# --- M-PESA PAYMENTS ROUTES ---

@api.route("/api/payments/stkpush", methods=["POST"])
@rate_limit(max_requests=5, window_seconds=60)
@jwt_required()
def stk_push():
    payload = request.get_json() or {}
    amount = payload.get("amount")
    phone = (payload.get("phone") or "").strip()
    user = User.query.get(get_jwt_identity())
    if not user:
        return jsonify({"error": "Please sign in again before making a payment."}), 401
    email = user.email

    try:
        amount = float(amount)
    except (TypeError, ValueError):
        amount = 0
    if not amount or amount <= 0 or not amount.is_integer() or not phone:
        return jsonify({"error": "Amount and phone number are required."}), 400

    if not re.fullmatch(r"\d{10,12}", phone.replace("+", "")):
        return jsonify({"error": "Enter a valid phone number for M-Pesa."}), 400

    try:
        result = generate_stk_push_payload(amount, phone, email)
    except Exception as exc:
        logger.exception("STK push payload generation failed")
        return jsonify({"error": "Payment processing error", "message": "We could not start the payment request right now."}), 500

    if "error" in result:
        return jsonify({
            "error": result.get("error", "Payment processing error"),
            "message": result.get("message") or result.get("error") or "We could not start the payment request right now.",
        }), 503

    try:
        checkout_id = result.get("checkout_request_id")
        merchant_id = result.get("merchant_request_id")
        tx = PaymentTransaction(
            checkout_request_id=checkout_id,
            merchant_request_id=merchant_id,
            phone=phone,
            email=email,
            amount=float(amount) if amount else None,
            status="initiated"
        )
        db.session.add(tx)
        db.session.commit()
    except Exception as e:
        logger.exception(f"Failed to persist MPESA transaction: {e}")
        db.session.rollback()
        return jsonify({"error": "We could not save the payment reference. If you received an M-Pesa prompt, do not retry; call our team to confirm the payment."}), 503

    return jsonify(result), 200


@api.route("/api/payments/status/<checkout_id>", methods=["GET"])
def payment_status(checkout_id):
    tx = PaymentTransaction.query.filter_by(checkout_request_id=checkout_id).first()

    if not tx:
        return jsonify({"error": "Transaction not found"}), 404

    return jsonify({
        "checkout_request_id": tx.checkout_request_id,
        "status": tx.status
    }), 200


@api.route("/api/payments/callback", methods=["POST"])
def mpesa_callback():
    """Authenticate, deduplicate, reconcile and atomically apply callbacks."""
    callback_token = current_app.config.get("MPESA_CALLBACK_TOKEN", "")
    supplied_token = request.args.get("token", "")
    if not callback_token or not hmac.compare_digest(supplied_token, callback_token):
        return jsonify({"ResultCode": 1, "ResultDesc": "Unauthorized callback"}), 403
    payload = request.get_json(silent=True)
    callback = (payload or {}).get("Body", {}).get("stkCallback", {})
    checkout_id, result_code = callback.get("CheckoutRequestID"), callback.get("ResultCode")
    if not isinstance(checkout_id, str) or not checkout_id or type(result_code) is not int:
        return jsonify({"ResultCode": 1, "ResultDesc": "Invalid callback payload"}), 400

    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    payload_hash = hashlib.sha256(canonical).hexdigest()
    prior = MpesaCallbackEvent.query.filter_by(checkout_request_id=checkout_id).with_for_update().first()
    if prior:
        if prior.payload_sha256 != payload_hash:
            logger.error("Conflicting M-Pesa callback replay for %s", checkout_id)
            return jsonify({"ResultCode": 0, "ResultDesc": "Callback recorded; reconciliation required"}), 200
        return jsonify({"ResultCode": 0, "ResultDesc": "Duplicate callback acknowledged"}), 200

    metadata = {
        item.get("Name"): item.get("Value")
        for item in (callback.get("CallbackMetadata", {}) or {}).get("Item", [])
        if isinstance(item, dict) and item.get("Name")
    }
    tx = PaymentTransaction.query.filter_by(checkout_request_id=checkout_id).with_for_update().first()
    eulogy = Eulogy.query.filter_by(checkout_request_id=checkout_id).with_for_update().first()
    event = MpesaCallbackEvent(checkout_request_id=checkout_id, payload_sha256=payload_hash, result_code=result_code)
    db.session.add(event)
    try:
        if tx is None and eulogy is None:
            event.error = "unknown_checkout_request_id"
        elif result_code == 0:
            try:
                paid_amount = Decimal(str(metadata["Amount"]))
                receipt = str(metadata["MpesaReceiptNumber"]).strip()
            except (KeyError, InvalidOperation, ValueError):
                paid_amount, receipt = None, ""
            expected = Decimal(str(tx.amount)) if tx and tx.amount is not None else None
            receipt_used = bool(
                receipt and (
                    PaymentTransaction.query.filter(
                        PaymentTransaction.mpesa_receipt == receipt,
                        PaymentTransaction.id != tx.id if tx else True,
                    ).first()
                    or Eulogy.query.filter(Eulogy.mpesa_receipt == receipt, Eulogy.checkout_request_id != checkout_id).first()
                )
            )
            if tx is None or not receipt or paid_amount is None or expected is None or paid_amount != expected or receipt_used:
                event.error = "amount_or_receipt_reconciliation_failed"
                if tx:
                    tx.status = "reconciliation_required"
            else:
                if tx:
                    tx.status = "completed"
                    tx.mpesa_receipt = receipt
                    tx.callback_received_at = datetime.datetime.utcnow()
                if eulogy:
                    eulogy.payment_status = "paid"
                    eulogy.mpesa_receipt = receipt
        else:
            if tx and tx.status not in {"completed", "reconciliation_required"}:
                tx.status = "failed"
            if eulogy and eulogy.payment_status != "paid":
                eulogy.payment_status = "failed"
        event.processed_at = datetime.datetime.utcnow()
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("M-Pesa callback could not be applied; provider may retry")
        return jsonify({"ResultCode": 1, "ResultDesc": "Callback could not be safely applied"}), 500

    if event.error:
        logger.error("M-Pesa reconciliation required: checkout=%s reason=%s", checkout_id, event.error)
        return jsonify({"ResultCode": 0, "ResultDesc": "Callback recorded for reconciliation"}), 200
    if result_code == 0 and eulogy:
        from . import mail
        domain = os.getenv("FRONTEND_URL", "http://localhost:4173")
        send_eulogy_email(eulogy, f"{domain}/memorial/{eulogy.id}", mail)
    if result_code == 0 and tx and tx.email:
        try:
            from flask_mail import Message
            from . import mail
            msg = Message(
                subject="Your Payment Receipt - Last Planner Julz Funeral Planning Hub",
                sender=("Last Planner Julz Funeral Planning Hub", current_app.config.get("MAIL_USERNAME")),
                recipients=[tx.email],
            )
            msg.body = f"Payment received. M-Pesa receipt: {metadata.get('MpesaReceiptNumber')}. Amount: KES {metadata.get('Amount')}."
            send_mail_message(msg, mail)
        except Exception:
            logger.exception("Receipt email failed after payment was recorded")
    return jsonify({"ResultCode": 0, "ResultDesc": "Callback processed successfully"}), 200


@api.route('/api/consultations', methods=['POST'])
@rate_limit(max_requests=5, window_seconds=60)
def request_consultation():
    from flask_mail import Message
    from . import mail

    data = request.json or {}
    name = (data.get('name') or '').strip()
    user_email = (data.get('email') or '').strip().lower()
    phone = (data.get('phone') or '').strip()
    questions = (data.get('questions') or 'No questions provided.').strip()

    if not name or not user_email or not phone:
        return jsonify({"error": "Missing required details", "message": "Please complete your name, email, and phone number."}), 400

    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", user_email):
        return jsonify({"error": "Invalid email", "message": "Please provide a valid email address."}), 400
    if len(name) > 120 or len(user_email) > 254 or len(phone) > 50 or len(questions) > 3000:
        return jsonify({"error": "Details too long", "message": "Please shorten your details and try again."}), 400

    try:
        consult = Consultation(name=name, email=user_email, phone=phone, questions=questions)
        db.session.add(consult)
        db.session.commit()

        mail_username = current_app.config.get('MAIL_USERNAME')
        notification_sent = False
        if mail_username:
            safe_name = escape_html(name)
            safe_email = escape_html(user_email)
            safe_phone = escape_html(phone)
            safe_questions = escape_html(questions)
            msg = Message(
                subject="New Consultation Request",
                sender=mail_username,
                recipients=[mail_username],
                reply_to=safe_email,
            )

            msg.html = f"""
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E8DFD1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background-color: #1F2E27; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #A8895C; margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 1px;">Last Planner Julz Funeral Planning Hub</h1>
                    <p style="color: #F8F6F0; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Funeral Planning & Memorial Support</p>
                </div>
                <div style="padding: 40px 30px; background-color: #FFFFFF; color: #3D3530;">
                    <h2 style="border-bottom: 2px solid #EFEAE0; padding-bottom: 15px; margin-top: 0; font-family: Georgia, serif; font-size: 22px; color: #1F2E27;">New Consultation Request</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0; width: 100px;"><strong>Name:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0;">{safe_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0;"><strong>Email:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0;"><a href="mailto:{safe_email}" style="color: #A8895C; text-decoration: none;">{safe_email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0;"><strong>Phone:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0;">{safe_phone}</td>
                        </tr>
                    </table>
                    <div style="background-color: #F8F6F0; padding: 20px; border-left: 4px solid #A8895C; border-radius: 0 4px 4px 0; margin-top: 30px;">
                        <h3 style="margin-top: 0; margin-bottom: 10px; color: #1F2E27; font-size: 16px;">Questions & Notes</h3>
                        <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">{safe_questions}</p>
                    </div>
                </div>
            </div>
            """
            notification_sent = send_mail_message(msg, mail)

        if notification_sent:
            return jsonify({"message": "Your request has been received. Our team will follow up using the contact details you provided."}), 200
        return jsonify({"message": "Your request has been saved, but we could not notify the team automatically. Please call +254 799 847 727 to make sure we see it."}), 202

    except Exception as e:
        db.session.rollback()
        logger.exception("Consultation request could not be saved")
        return jsonify({"error": "Consultation request could not be saved", "message": "We could not save your request. Please call +254 799 847 727 or try again later."}), 500

# ==========================================
# --- USER PROFILE & ACCOUNT ENDPOINTS ---
# ==========================================

def _current_user_from_token():
    try:
        return db.session.get(User, int(get_jwt_identity()))
    except (TypeError, ValueError):
        return None

@api.route("/api/user/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    user = _current_user_from_token()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "email": user.email,
        "first_name": getattr(user, 'first_name', ''),
        "last_name": getattr(user, 'last_name', ''),
        "phone": getattr(user, 'phone', ''),
        "profile_picture": getattr(user, 'profile_picture', ''),
        "is_verified": user.is_verified
    }), 200

@api.route("/api/user/profile", methods=["PUT"])
@jwt_required()
def update_user_profile():
    user = _current_user_from_token()
    data = _json_payload()
    if not user:
        return jsonify({"error": "User not found. Please sign in again."}), 404

    for field, maximum in (("first_name", 80), ("last_name", 80), ("phone", 50), ("profile_picture", 2_000_000)):
        if field not in data:
            continue
        value = data[field]
        if value is not None and not isinstance(value, str):
            return jsonify({"error": f"{field.replace('_', ' ').capitalize()} must be text."}), 400
        value = (value or "").strip()
        if len(value) > maximum:
            return jsonify({"error": f"{field.replace('_', ' ').capitalize()} is too long."}), 400
        setattr(user, field, value or (None if field in {"phone", "profile_picture"} else ""))

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("Profile update failed")
        return jsonify({"error": "We could not save your profile. Please try again."}), 500
    return jsonify({"message": "Profile updated successfully!"}), 200

@api.route("/api/user/password", methods=["PUT"])
@jwt_required()
def update_user_password():
    user = _current_user_from_token()
    if not user:
        return jsonify({"error": "User not found. Please sign in again."}), 404
    data = _json_payload()
    current_password = data.get("current_password", "")
    new_password = data.get("password", "")

    if not user.check_password(current_password):
        return jsonify({"error": "Your current password is incorrect."}), 400
    password_error = _password_validation_error(new_password)
    if password_error:
        return jsonify({"error": password_error}), 400

    try:
        user.set_password(new_password)
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("Password update failed")
        return jsonify({"error": "We could not update your password. Please try again."}), 500
    return jsonify({"message": "Security credentials updated successfully!"}), 200

@api.route("/api/user/account", methods=["DELETE"])
@jwt_required()
def delete_user_account():
    user = _current_user_from_token()
    if not user:
        return jsonify({"error": "User account not found."}), 404

    profile_picture = user.profile_picture
    uploaded_filenames = [item.filename for item in UploadedFile.query.filter_by(user_id=user.id).all()]
    try:
        order_ids = [order.id for order in Order.query.filter_by(user_id=user.id).all()]
        if order_ids:
            OrderItem.query.filter(OrderItem.order_id.in_(order_ids)).delete(synchronize_session=False)
        Order.query.filter_by(user_id=user.id).delete(synchronize_session=False)
        Eulogy.query.filter_by(user_id=user.id).delete(synchronize_session=False)
        ProductReview.query.filter_by(user_id=user.id).delete(synchronize_session=False)
        UploadedFile.query.filter_by(user_id=user.id).delete(synchronize_session=False)
        Consultation.query.filter_by(email=user.email).delete(synchronize_session=False)
        AuthChallenge.query.filter_by(user_id=user.id).delete(synchronize_session=False)

        # Preserve payment audit fields while removing direct account contact details.
        PaymentTransaction.query.filter_by(email=user.email).update(
            {"email": f"deleted-{uuid.uuid4().hex}@deleted.invalid", "phone": None},
            synchronize_session=False,
        )
        db.session.delete(user)
        db.session.commit()
    except Exception:
        db.session.rollback()
        logger.exception("Account deletion could not be completed")
        return jsonify({"error": "We could not complete account deletion. Please contact support."}), 500

    if profile_picture and profile_picture.startswith("/static/uploads/"):
        uploaded_filenames.append(os.path.basename(profile_picture))
    for filename in set(uploaded_filenames):
        try:
            delete_object(filename)
        except Exception:
            # Keep this key in an operational cleanup queue/log rather than
            # failing account deletion after its database transaction commits.
            logger.exception("Deleted account object could not be removed: %s", filename)

    return jsonify({"message": "Account profile, linked orders, reviews, eulogies, and consultation requests were deleted. Payment totals and status records remain with email and phone removed."}), 200

def register_routes(app):
    app.register_blueprint(api)
