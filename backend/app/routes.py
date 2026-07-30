import requests as py_requests
import secrets
import datetime
import random
import logging
import re
import os
import uuid 
import io
import qrcode
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from functools import wraps
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from .models import db, FuneralService, User, Eulogy, Consultation, Product, ProductImage, ProductSpecification, ProductReview, Order, OrderItem, PaymentTransaction, Memorial, JournalEntry, GalleryImage, MemorialCandle, FamilyTreeMember
from .mpesa import generate_stk_push_payload

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api = Blueprint("api", __name__)

# --- SECURITY MIDDLEWARE ---

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
    raw_text = eulogy.personality
    metadata = {}
    story_text = raw_text
    
    # 1. PARSE THE METADATA FROM THE FRONTEND
    match = re.search(r'\[PRODUCTION METADATA\](.*?)\[/PRODUCTION METADATA\]', raw_text, re.DOTALL)
    if match:
        meta_block = match.group(1)
        for line in meta_block.strip().split('\n'):
            if ':' in line:
                key, val = line.split(':', 1)
                metadata[key.strip()] = val.strip()
        # Remove the metadata block so it doesn't print in the PDF
        story_text = raw_text.replace(match.group(0), '').strip()

    # 2. MAP FRONTEND TEMPLATES TO PDF COLOR THEMES
    template_name = metadata.get("Template", "Executive Minimal")
    themes = {
        "Executive Minimal": {"bg": "#F8F6F0", "text": "#1F2E27", "accent": "#A8895C"},
        "Blue Rose Border": {"bg": "#E8F0F8", "text": "#172A3A", "accent": "#4A90E2"}, 
        "Dark Golden Flora": {"bg": "#1F2E27", "text": "#F8F6F0", "accent": "#D4AF37"}, 
        "Classic Parchment": {"bg": "#F4ECD8", "text": "#3D3530", "accent": "#8F744D"} 
    }
    theme = themes.get(template_name, themes["Executive Minimal"])

    # 3. MAP FRONTEND FONTS TO PDF STANDARD FONTS
    font_name = metadata.get("Font", "Classic Serif")
    base_font, base_font_bold, base_font_italic = "Times-Roman", "Times-Bold", "Times-Italic"
    
    if "Modern" in font_name:
        base_font, base_font_bold, base_font_italic = "Helvetica", "Helvetica-Bold", "Helvetica-Oblique"
    elif "Typewriter" in font_name:
        base_font, base_font_bold, base_font_italic = "Courier", "Courier-Bold", "Courier-Oblique"

    # Scale the web font size slightly down for print
    font_size = int(metadata.get("Size", "16").replace("px", ""))
    pdf_font_size = max(10, min(16, font_size * 0.75))

    # 4. SETUP DOCUMENT & BACKGROUND PAINTER
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    
    def paint_background(canvas, doc):
        canvas.saveState()
        canvas.setFillColorHex(theme["bg"])
        canvas.rect(0, 0, letter[0], letter[1], fill=True, stroke=False)
        canvas.restoreState()

    # 5. DEFINE PDF TYPOGRAPHY STYLES
    styles = getSampleStyleSheet()
    
    cover_title = ParagraphStyle('CoverTitle', fontName=base_font_bold, fontSize=32, leading=38, textColor=colors.HexColor(theme["text"]), alignment=TA_CENTER, spaceAfter=20)
    cover_subtitle = ParagraphStyle('CoverSubtitle', fontName=base_font_italic, fontSize=12, textColor=colors.HexColor(theme["accent"]), alignment=TA_CENTER, spaceAfter=30, textTransform='uppercase')
    cover_dates = ParagraphStyle('CoverDates', fontName=base_font_bold, fontSize=12, textColor=colors.HexColor(theme["text"]), alignment=TA_CENTER, spaceAfter=50)
    
    chapter_title = ParagraphStyle('ChapterTitle', fontName=base_font_bold, fontSize=pdf_font_size + 4, textColor=colors.HexColor(theme["text"]), alignment=TA_LEFT, spaceAfter=10, textTransform='uppercase')
    body_text = ParagraphStyle('BodyText', fontName=base_font, fontSize=pdf_font_size, leading=pdf_font_size * 1.6, textColor=colors.HexColor(theme["text"]), alignment=TA_LEFT, spaceAfter=15)

    story = []

    # --- BUILD PAGE 1: THE COVER ---
    story.append(Spacer(1, 120)) 
    story.append(Paragraph("In Loving Memory Of", cover_subtitle))
    story.append(Paragraph(eulogy.deceased_name, cover_title))
    
    story.append(Paragraph(f"<font color='{theme['accent']}'>________________________</font>", cover_dates))
    
    dates_text = f"{eulogy.birth_year[:4] if eulogy.birth_year else 'YYYY'} — {eulogy.passing_year[:4] if eulogy.passing_year else 'YYYY'}"
    story.append(Paragraph(dates_text, cover_dates))
    
    story.append(PageBreak()) 

    # --- BUILD PAGES 2+: THE CHAPTERS ---
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

    # --- BUILD FINAL PAGE: QR CODE ---
    story.append(Spacer(1, 30))
    story.append(Paragraph(f"<font color='{theme['accent']}'>________________________</font>", cover_dates))
    story.append(Paragraph("Digital Memorial Space", chapter_title))
    story.append(Paragraph("Scan the code below with your mobile device to visit the interactive digital tribute, view memories, and leave your condolences.", body_text))
    
    qr_bytes = generate_qr_code(memorial_url)
    qr_buffer = io.BytesIO(qr_bytes)
    story.append(RLImage(qr_buffer, width=120, height=120))

    # Render Document
    doc.build(story, onFirstPage=paint_background, onLaterPages=paint_background)
    buffer.seek(0)
    return buffer.getvalue()

def send_eulogy_email(eulogy, memorial_url, mail_instance):
    from flask_mail import Message
    try:
        msg = Message(
            subject=f"Digital Eulogy & QR Code - In Memory of {eulogy.deceased_name}",
            sender=("Last Planner Julz Hub", current_app.config.get('MAIL_USERNAME')),
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

        mail_instance.send(msg)
        logger.info(f"[SUCCESS] Eulogy assets emailed to {eulogy.recipient_email}")
    except Exception as e:
        logger.error(f"[ERROR] Eulogy email delivery failed: {str(e)}")


# --- AUTHENTICATION ROUTES ---

@api.route("/api/auth/register", methods=["POST"])
def register():
    from flask_mail import Message
    from . import mail

    payload = request.get_json() or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"message": "Please provide a valid email address."}), 400

    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters long."}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    new_user = User(email=email)
    new_user.set_password(password)
    new_user.is_verified = False

    otp_code = str(random.randint(100000, 999999))
    new_user.otp_code = otp_code
    new_user.otp_expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)

    db.session.add(new_user)
    db.session.commit()

    try:
        msg = Message(
            subject="Your Last Planner Julz Hub Verification Code",
            sender=("Last Planner Julz Hub Security", current_app.config.get('MAIL_USERNAME')),
            recipients=[email]
        )
        msg.html = f"""
        <div style="font-family: Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 40px 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #E8DFD1;">
            <div style="background-color: #1F2E27; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 1px;">Verify Your Email</h1>
            </div>
            <div style="padding: 40px 30px; text-align: center;">
              <p style="color: #3D3530; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                Welcome to Last Planner Julz Hub. Please use the verification code below to securely access your account.
              </p>
              <div style="background-color: #F8F6F0; border: 1px solid #E8DFD1; border-radius: 8px; padding: 20px; display: inline-block; margin-bottom: 30px;">
                <span style="color: #A8895C; font-size: 36px; font-weight: bold; letter-spacing: 12px;">{otp_code}</span>
              </div>
              <p style="color: #716860; font-size: 14px; margin-bottom: 0;">
                <strong>Note:</strong> This code will expire in 10 minutes.
              </p>
            </div>
          </div>
        </div>
        """
        mail.send(msg)
    except Exception as e:
        logger.error(f"Failed to send welcome OTP email: {e}")

    return jsonify({"message": "User created successfully"}), 201


@api.route("/api/auth/login", methods=["POST"])
def login():
    payload = request.get_json() or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        token = create_access_token(identity=str(user.id))
        return jsonify({
            "token": token,
            "is_verified": bool(user.is_verified),
            "is_admin": bool(user.is_admin) 
        }), 200

    return jsonify({"message": "Invalid email or password"}), 401


@api.route("/api/auth/google", methods=["POST"])
def google_login():
    payload = request.get_json() or {}
    access_token = payload.get("token")
    
    if not access_token:
        return jsonify({"message": "No Google authentication token provided."}), 400
        
    google_response = py_requests.get(f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={access_token}")
    
    if not google_response.ok:
        return jsonify({"message": "Invalid or expired Google token."}), 401
        
    google_user = google_response.json()
    email = google_user.get("email").lower()
    
    if not email:
        return jsonify({"message": "No email address associated with this Google account."}), 400
        
    user = User.query.filter_by(email=email).first()
    
    if not user:
        user = User(email=email)
        user.set_password(secrets.token_urlsafe(32))
        user.is_verified = True 
        db.session.add(user)
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
    payload = request.get_json() or {}
    access_token = payload.get("token")
    
    if not access_token:
        return jsonify({"message": "No Facebook authentication token provided."}), 400
        
    fb_response = py_requests.get(f"https://graph.facebook.com/me?fields=id,name,email&access_token={access_token}")
    
    if not fb_response.ok:
        return jsonify({"message": "Invalid or expired Facebook token."}), 401
        
    fb_user = fb_response.json()
    email = fb_user.get("email")
    
    if not email:
        return jsonify({"message": "Your Facebook account does not have a public email address. Please use standard registration."}), 400
        
    email = email.lower()
    user = User.query.filter_by(email=email).first()
    
    if not user:
        user = User(email=email)
        user.set_password(secrets.token_urlsafe(32))
        user.is_verified = True 
        db.session.add(user)
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
    payload = request.get_json() or {}
    
    auth_code = payload.get("code")
    client_id = payload.get("client_id")
    redirect_uri = payload.get("redirect_uri")
    
    if not auth_code or not client_id:
        return jsonify({"message": "Missing X/Twitter authorization data."}), 400
        
    token_url = "https://api.twitter.com/2/oauth2/token"
    data = {
        "code": auth_code,
        "grant_type": "authorization_code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "code_verifier": "challenge12345678901234567890123456789012345" 
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    
    token_res = py_requests.post(token_url, data=data, headers=headers)
    
    if not token_res.ok:
        return jsonify({"message": "Invalid or expired X/Twitter authorization code."}), 401
        
    access_token = token_res.json().get("access_token")
    
    user_headers = {"Authorization": f"Bearer {access_token}"}
    twitter_response = py_requests.get("https://api.twitter.com/2/users/me?user.fields=email", headers=user_headers)
    
    if not twitter_response.ok:
        return jsonify({"message": "Failed to fetch user profile from X/Twitter."}), 401
        
    twitter_user = twitter_response.json().get("data", {})
    email = twitter_user.get("email")
    
    if not email:
        return jsonify({"message": "Your X account does not have a public email address. Please use standard registration."}), 400
        
    email = email.lower()
    user = User.query.filter_by(email=email).first()
    
    if not user:
        user = User(email=email)
        user.set_password(secrets.token_urlsafe(32))
        user.is_verified = True 
        db.session.add(user)
        db.session.commit()
        
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "token": token,
        "email": user.email, 
        "is_verified": user.is_verified,
        "is_admin": bool(user.is_admin)
    }), 200


@api.route("/api/auth/send-otp", methods=["POST"])
def send_otp():
    from flask_mail import Message
    from . import mail

    payload = request.get_json() or {}
    email = (payload.get("email") or "").strip().lower()

    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"message": "Please provide a valid email address."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    otp_code = str(random.randint(100000, 999999))
    user.otp_code = otp_code
    user.otp_expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    db.session.commit()

    try:
        msg = Message(
            subject="Your Last Planner Julz Hub Verification Code",
            sender=("Last Planner Julz Hub Security", current_app.config.get('MAIL_USERNAME')),
            recipients=[email]
        )

        msg.html = f"""
        <div style="font-family: Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 40px 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #E8DFD1;">
            <div style="background-color: #1F2E27; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: normal; letter-spacing: 1px;">Verify Your Email</h1>
            </div>
            <div style="padding: 40px 30px; text-align: center;">
              <p style="color: #3D3530; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                Welcome to Last Planner Julz Hub. Please use the verification code below to securely access your account.
              </p>
              <div style="background-color: #F8F6F0; border: 1px solid #E8DFD1; border-radius: 8px; padding: 20px; display: inline-block; margin-bottom: 30px;">
                <span style="color: #A8895C; font-size: 36px; font-weight: bold; letter-spacing: 12px;">{otp_code}</span>
              </div>
              <p style="color: #716860; font-size: 14px; margin-bottom: 0;">
                <strong>Note:</strong> This code will expire in 10 minutes.
              </p>
            </div>
          </div>
        </div>
        """
        mail.send(msg)
        return jsonify({"message": "OTP sent successfully"}), 200

    except Exception as e:
        return jsonify({"message": "Failed to send email. Please try again.", "error": str(e)}), 500


@api.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    payload = request.get_json() or {}
    email = (payload.get("email") or "").strip().lower()
    code = (payload.get("code") or "").strip()

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.is_otp_valid(code):
        user.is_verified = True
        user.otp_code = None     
        user.otp_expires = None
        db.session.commit()
        return jsonify({"message": "Email verified successfully!"}), 200
    else:
        return jsonify({"message": "Invalid or expired verification code."}), 400


@api.route("/api/auth/reset-password", methods=["POST"])
def reset_password():
    payload = request.get_json() or {}
    email = (payload.get("email") or "").strip().lower()
    code = (payload.get("code") or "").strip()
    new_password = payload.get("new_password") or ""

    if len(new_password) < 6:
        return jsonify({"message": "Password must be at least 6 characters long."}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    if user.is_otp_valid(code):
        user.set_password(new_password)
        user.otp_code = None     
        user.otp_expires = None
        user.is_verified = True 
        
        db.session.commit()
        return jsonify({"message": "Password reset successfully!"}), 200
    else:
        return jsonify({"message": "Invalid or expired verification code."}), 400


# ==========================================
# --- MEMORIAL HUB API ROUTES ---
# ==========================================

@api.route("/api/memorials", methods=["POST"])
def create_memorial():
    payload = request.get_json() or {}
    new_memorial = Memorial(
        id=payload.get("id"),
        name=payload.get("name"),
        general_pin=payload.get("pin"),
        nuclear_pin=payload.get("familyTreePin"),
        donation_number=payload.get("donationNumber"),
        portrait_url=payload.get("portrait"),
        security_question=payload.get("securityQuestion"),
        security_answer=payload.get("securityAnswer", "").lower().strip()
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
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, filename)
        file.save(file_path)
        return jsonify({"image_url": f"/static/uploads/{filename}"}), 200

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
        "total_revenue": revenue,
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
        dispatch_location=payload.get("dispatch_location", "Nairobi Central")
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
    return jsonify({"status": "ok"})


# --- M-PESA PAYMENTS ROUTES ---

@api.route("/api/payments/stkpush", methods=["POST"])
def stk_push():
    payload = request.get_json() or {}
    amount = payload.get("amount")
    phone = (payload.get("phone") or "").strip()
    email = (payload.get("email") or "").strip().lower()

    if not amount or not phone:
        return jsonify({"error": "Amount and phone number are required."}), 400

    if not re.fullmatch(r"\d{10,12}", phone.replace("+", "")):
        return jsonify({"error": "Enter a valid phone number for M-Pesa."}), 400

    result = generate_stk_push_payload(amount, phone, email)
    
    if "error" in result:
        return jsonify(result), 500

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
@require_safaricom_ip
def mpesa_callback():
    from flask_mail import Message
    from . import mail
    
    try:
        data = request.get_json()
        customer_email = request.args.get("email") 

        callback_data = data.get("Body", {}).get("stkCallback", {})
        result_code = callback_data.get("ResultCode")
        
        checkout_id = callback_data.get("CheckoutRequestID")
        tx = None
        
        # 1. Update Payment Transaction Table
        if checkout_id:
            tx = PaymentTransaction.query.filter_by(checkout_request_id=checkout_id).first()
            if tx:
                if not customer_email and tx.email:
                    customer_email = tx.email
                tx.status = 'completed' if result_code == 0 else 'failed'
                db.session.commit()

        # 2. Check if this payment was for a Eulogy Order
        eulogy = None
        if checkout_id:
            eulogy = Eulogy.query.filter_by(checkout_request_id=checkout_id).first()

        # 3. Handle Success (Payment Went Through!)
        if result_code == 0:
            metadata = callback_data.get("CallbackMetadata", {}).get("Item", [])
            receipt_no = next((item["Value"] for item in metadata if item["Name"] == "MpesaReceiptNumber"), "N/A")
            amount_paid = next((item["Value"] for item in metadata if item["Name"] == "Amount"), "N/A")
            
            # --- EULOGY ENGINE TRIGGER ---
            if eulogy:
                eulogy.payment_status = 'paid'
                eulogy.mpesa_receipt = receipt_no
                db.session.commit()
                
                # Fetch base URL from env, default to local preview port
                domain = os.getenv('FRONTEND_URL', 'http://localhost:5173')
                memorial_url = f"{domain}/memorial/{eulogy.id}"
                
                # Draw PDF, build QR, and email it!
                send_eulogy_email(eulogy, memorial_url, mail)
            
            # --- STANDARD RECEIPT TRIGGER ---
            if customer_email:
                try:
                    msg = Message(
                        subject="Your Payment Receipt - Last Planner Julz Hub",
                        sender=("Last Planner Julz Hub", current_app.config.get('MAIL_USERNAME')), 
                        recipients=[customer_email]
                    )
                    msg.html = f"""
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #E8DFD1; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.03);">
                        <div style="background-color: #1F2E27; padding: 25px; text-align: center;">
                            <h1 style="color: #A8895C; margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 1px;">Last Planner Julz Hub</h1>
                            <p style="color: #F8F6F0; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">Order Confirmed</p>
                        </div>
                        <div style="padding: 35px 25px; background-color: #FFFFFF; color: #3D3530;">
                            <h2 style="margin-top: 0; font-family: Georgia, serif; font-size: 18px; color: #1F2E27;">Thank You For Your Order</h2>
                            <p style="font-size: 14px; line-height: 1.5; color: #555555;">We have successfully cleared your payment through M-Pesa. Your transaction details have been logged securely into our accounting hub.</p>
                            <div style="background-color: #F8F6F0; border-left: 4px solid #A8895C; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                                <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 4px 0; color: #716860;"><strong>M-Pesa Receipt:</strong></td>
                                        <td style="padding: 4px 0; font-family: monospace; font-size: 14px; color: #1F2E27; text-align: right;"><strong>{receipt_no}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #716860;"><strong>Amount Paid:</strong></td>
                                        <td style="padding: 4px 0; color: #1F2E27; text-align: right;">KSH {amount_paid}.00</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; color: #716860;"><strong>Payment Status:</strong></td>
                                        <td style="padding: 4px 0; color: green; text-align: right; font-weight: 500;">Settled (Live)</td>
                                    </tr>
                                </table>
                            </div>
                            <p style="font-size: 13px; color: #8F847C; margin-bottom: 0;">Our administrative operators will reach out to organize coordination arrangements shortly.</p>
                        </div>
                        <div style="background-color: #EFEAE0; padding: 15px; text-align: center; font-size: 11px; color: #8F744D;">
                            <p style="margin: 0;">Last Planner Julz Hub • Kenya</p>
                        </div>
                    </div>
                    """
                    mail.send(msg)
                except Exception as mail_err:
                    logger.error(f"[MAIL ERROR] Automated receipt transmission faulted: {mail_err}")
        
        # 4. Handle Failure (Insufficient Funds, Cancelled, etc)
        else:
            if eulogy:
                eulogy.payment_status = 'failed'
                db.session.commit()
            logger.info(f"Payment failed/cancelled. ResultCode: {result_code}")

        return jsonify({"ResultCode": 0, "ResultDesc": "Callback processed successfully"}), 200

    except Exception as e:
        logger.exception("Callback processing failed")
        return jsonify({"ResultCode": 1, "ResultDesc": "Callback processing failed", "error": str(e)}), 500


@api.route('/api/consultations', methods=['POST'])
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

    try:
        consult = Consultation(name=name, email=user_email, phone=phone, questions=questions)
        db.session.add(consult)
        db.session.commit()

        mail_username = current_app.config.get('MAIL_USERNAME')
        if mail_username:
            msg = Message(
                subject=f"New Consultation Request: {name}",
                sender=(f"{name} via Last Planner Julz Hub", mail_username), 
                recipients=[mail_username],
                reply_to=(name, user_email) 
            )

            msg.html = f"""
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E8DFD1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background-color: #1F2E27; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #A8895C; margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 1px;">Last Planner Julz Hub</h1>
                    <p style="color: #F8F6F0; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Funeral Home & Memorials</p>
                </div>
                <div style="padding: 40px 30px; background-color: #FFFFFF; color: #3D3530;">
                    <h2 style="border-bottom: 2px solid #EFEAE0; padding-bottom: 15px; margin-top: 0; font-family: Georgia, serif; font-size: 22px; color: #1F2E27;">New Consultation Request</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0; width: 100px;"><strong>Name:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0;">{name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0;"><strong>Email:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0;"><a href="mailto:{user_email}" style="color: #A8895C; text-decoration: none;">{user_email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0;"><strong>Phone:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #EFEAE0;">{phone}</td>
                        </tr>
                    </table>
                    <div style="background-color: #F8F6F0; padding: 20px; border-left: 4px solid #A8895C; border-radius: 0 4px 4px 0; margin-top: 30px;">
                        <h3 style="margin-top: 0; margin-bottom: 10px; color: #1F2E27; font-size: 16px;">Questions & Notes</h3>
                        <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">{questions}</p>
                    </div>
                </div>
            </div>
            """
            mail.send(msg)

        return jsonify({"message": "Consultation request sent successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e), "message": "Consultation request received, but delivery could not be completed right now."}), 200


def register_routes(app):
    from flask_cors import CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.register_blueprint(api)