import requests as py_requests
import secrets
import datetime
import random
import logging
import re
import os
import uuid 
from functools import wraps
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from .models import db, FuneralService, Tribute, User, Eulogy, Consultation, Product, ProductImage, ProductSpecification, ProductReview, Order, OrderItem, PaymentTransaction
from .mpesa import generate_stk_push_payload

# --- INITIALIZE PRO-GRADE LOGGER ---
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
        logger.info(f"Welcome OTP successfully sent to {email}")
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


# --- PRO-GRADE GOOGLE SSO ROUTE ---
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
        logger.info(f"New account created seamlessly via Google SSO: {email}")
        
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "token": token,
        "email": user.email, 
        "is_verified": user.is_verified,
        "is_admin": bool(user.is_admin)
    }), 200


# --- PRO-GRADE FACEBOOK SSO ROUTE ---
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
        logger.info(f"New account created seamlessly via Facebook SSO: {email}")
        
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "token": token,
        "email": user.email, 
        "is_verified": user.is_verified,
        "is_admin": bool(user.is_admin)
    }), 200


# --- PRO-GRADE X (TWITTER) PKCE ROUTE ---
@api.route("/api/auth/twitter", methods=["POST"])
def twitter_login():
    payload = request.get_json() or {}
    
    # X uses a strict PKCE flow, requiring a code exchange, not a direct token.
    auth_code = payload.get("code")
    client_id = payload.get("client_id")
    redirect_uri = payload.get("redirect_uri")
    
    if not auth_code or not client_id:
        return jsonify({"message": "Missing X/Twitter authorization data."}), 400
        
    # Step 1: Exchange the Code for an Access Token
    token_url = "https://api.twitter.com/2/oauth2/token"
    data = {
        "code": auth_code,
        "grant_type": "authorization_code",
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        # This matches the exact 43-character string generated by our frontend
        "code_verifier": "challenge12345678901234567890123456789012345" 
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    
    token_res = py_requests.post(token_url, data=data, headers=headers)
    
    if not token_res.ok:
        logger.error(f"X Token Exchange Error: {token_res.text}")
        return jsonify({"message": "Invalid or expired X/Twitter authorization code."}), 401
        
    access_token = token_res.json().get("access_token")
    
    # Step 2: Fetch the User's Email using the new Access Token
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
        logger.info(f"New account created seamlessly via X/Twitter SSO: {email}")
        
    token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "token": token,
        "email": user.email, 
        "is_verified": user.is_verified,
        "is_admin": bool(user.is_admin)
    }), 200


# --- SECURE OTP VERIFICATION ROUTES ---

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
        logger.exception(f"CRITICAL: Failed to send OTP email to {email}")
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


# --- PROTECTED DATA ROUTES ---

@api.route("/api/tributes", methods=["GET"])
@jwt_required()
def list_tributes():
    user_id = get_jwt_identity()
    tributes = Tribute.query.filter_by(user_id=user_id).limit(10).all()
    return jsonify([t.to_dict() for t in tributes])


@api.route("/api/tributes", methods=["POST"])
@jwt_required()
def create_tribute():
    user_id = get_jwt_identity()
    payload = request.get_json() or {}
    tribute = Tribute(
        name=payload.get("name", "Anonymous"),
        message=payload.get("message", ""),
        user_id=user_id
    )
    db.session.add(tribute)
    db.session.commit()
    return jsonify(tribute.to_dict()), 201


# --- EULOGY ROUTES ---

@api.route("/api/eulogies", methods=["POST"])
@jwt_required()
def create_eulogy():
    user_id = get_jwt_identity()
    payload = request.get_json() or {}
    
    try:
        new_eulogy = Eulogy(
            deceased_name=payload.get("deceased_name"),
            birth_year=payload.get("birth_year"),
            passing_year=payload.get("passing_year"),
            occupation=payload.get("occupation"),
            interests=payload.get("interests"),
            personality=payload.get("personality"),
            user_id=user_id
        )
        
        db.session.add(new_eulogy)
        db.session.commit()
        
        return jsonify({
            "message": "Eulogy saved successfully!",
            "eulogy_id": new_eulogy.id
        }), 201
        
    except Exception as e:
        logger.error(f"Eulogy creation failed: {e}")
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
@jwt_required()
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

@api.route("/api/debug/mock-purchase/<int:product_id>", methods=["POST"])
@jwt_required()
def debug_mock_purchase(product_id):
    user_id = get_jwt_identity()
    new_order = Order(user_id=user_id, total_amount=1000, status="completed")
    db.session.add(new_order)
    db.session.flush()
    purchased_item = OrderItem(order_id=new_order.id, product_id=product_id, quantity=1)
    db.session.add(purchased_item)
    db.session.commit()
    return jsonify({"message": f"Successfully simulated purchase of product {product_id}. You can now leave a review!"}), 200

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
    
    new_product = Product(
        category_id=payload.get("category_id", "casket_list"),
        title=payload.get("title"),
        description=payload.get("desc"),
        price=float(payload.get("price", 0)),
        discount_percent=int(payload.get("discount_percent", 0)),
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
    
    product.title = payload.get("title", product.title)
    product.description = payload.get("desc", product.description)
    product.price = float(payload.get("price", product.price))
    product.category_id = payload.get("category_id", product.category_id)
    product.discount_percent = int(payload.get("discount_percent", product.discount_percent))
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


@api.route("/api/services", methods=["GET"])
def list_services():
    services = [
        {"id": 1, "name": "Funeral Planning", "description": "Guided planning support."},
        {"id": 2, "name": "Obituary Writing", "description": "Compassionate services."},
        {"id": 3, "name": "Memorial Tributes", "description": "Personalized pages."},
    ]
    return jsonify(services)


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

    if email and not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"error": "Enter a valid email address."}), 400

    result = generate_stk_push_payload(amount, phone, email)
    
    if "error" in result:
        logger.error(f"STK Push Error: {result['error']}")
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
        logger.info(f"STK Push persisted: checkout={checkout_id} email={email}")
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


@api.route("/api/payments/mock", methods=["POST"])
def mock_payment():
    payload = request.get_json() or {}
    amount = payload.get("amount")
    phone = (payload.get("phone") or "").strip()
    email = (payload.get("email") or "").strip().lower()

    if not amount or not phone:
        return jsonify({"error": "Amount and phone number are required."}), 400

    if not re.fullmatch(r"\d{10,12}", phone.replace("+", "")):
        return jsonify({"error": "Enter a valid phone number for the mock payment flow."}), 400

    if email and not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"error": "Enter a valid email address."}), 400

    logger.info(f"[MOCK PAYMENT] amount={amount} phone={phone} email={email}")

    tx_id = f"MOCK-{int(datetime.datetime.utcnow().timestamp())}"
    return jsonify({"message": "Mock payment processed", "transaction_id": tx_id}), 200


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
        
        try:
            checkout_id = callback_data.get("CheckoutRequestID")
            if checkout_id:
                tx = PaymentTransaction.query.filter_by(checkout_request_id=checkout_id).first()
                if tx:
                    if not customer_email and tx.email:
                        customer_email = tx.email
                    tx.status = 'completed' if result_code == 0 else 'failed'
                    db.session.commit()
        except Exception:
            logger.debug("No transaction mapping found for callback or DB error")

        if result_code == 0:
            logger.info(f"--- M-PESA SUCCESS --- Callback Data: {callback_data}")
            
            metadata = callback_data.get("CallbackMetadata", {}).get("Item", [])
            receipt_no = next((item["Value"] for item in metadata if item["Name"] == "MpesaReceiptNumber"), "N/A")
            amount_paid = next((item["Value"] for item in metadata if item["Name"] == "Amount"), "N/A")
            
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
                    logger.info(f"[MAIL SYSTEM] Secure confirmation receipt sent straight to: {customer_email}")
                except Exception as mail_err:
                    logger.error(f"[MAIL ERROR] Callback succeeded, but automated receipt transmission faulted: {mail_err}")
        else:
            logger.error(f"--- M-PESA FAILED --- Reason: {callback_data.get('ResultDesc')}")
            
        return jsonify({"ResultCode": 0, "ResultDesc": "Callback processed successfully"}), 200

    except Exception as e:
        logger.exception("Error handling M-Pesa callback")
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
        return jsonify({"error": "Missing required consultation details", "message": "Please complete your name, email, and phone number."}), 400

    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", user_email):
        return jsonify({"error": "Invalid email", "message": "Please provide a valid email address."}), 400

    if not re.fullmatch(r"\d{10,12}", phone.replace("+", "")):
        return jsonify({"error": "Invalid phone", "message": "Please provide a valid phone number."}), 400

    try:
        consult = Consultation(name=name, email=user_email, phone=phone, questions=questions)
        db.session.add(consult)
        db.session.commit()

        mail_username = current_app.config.get('MAIL_USERNAME')
        mail_password = current_app.config.get('MAIL_PASSWORD')

        if not mail_username or not mail_password:
            logger.warning("Consultation request received, email credentials not configured. Saved request and returning success.")
            return jsonify({
                "message": "Consultation request received successfully. We will follow up with you shortly."
            }), 200

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
            <div style="background-color: #EFEAE0; padding: 20px; text-align: center; font-size: 12px; color: #8F744D;">
                <p style="margin: 0;">This is an automated notification from the Last Planner Julz Hub website.</p>
                <p style="margin: 5px 0 0 0;">Reply directly to this email to contact the family.</p>
            </div>
        </div>
        """

        mail.send(msg)
        return jsonify({"message": "Consultation request sent successfully!"}), 200

    except Exception as e:
        logger.exception("Failed to send consultation email")
        return jsonify({"error": str(e), "message": "Consultation request received, but delivery could not be completed right now."}), 200


def register_routes(app):
    from flask_cors import CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    app.register_blueprint(api)


@api.route('/api/debug/payment-transactions', methods=['GET'])
def debug_payment_transactions():
    try:
        from .models import PaymentTransaction

        allow = current_app.config.get('DEBUG') or os.environ.get('ALLOW_DEBUG_ENDPOINTS', '').lower() in ('1', 'true')
        if not allow:
            return jsonify({'message': 'Debug endpoints are disabled on this instance.'}), 403

        txs = PaymentTransaction.query.order_by(PaymentTransaction.created_at.desc()).limit(50).all()
        return jsonify([t.to_dict() for t in txs]), 200
    except Exception as e:
        logger.exception('Failed to fetch payment transactions')
        return jsonify({'error': str(e)}), 500


@api.route('/api/debug/status', methods=['GET'])
def debug_status():
    allow = current_app.config.get('DEBUG') or os.environ.get('ALLOW_DEBUG_ENDPOINTS', '').strip().lower() in ('1', 'true', 'yes')
    if not allow:
        return jsonify({'message': 'Debug endpoints are disabled on this instance.'}), 403

    mail_configured = bool(current_app.config.get('MAIL_USERNAME') and current_app.config.get('MAIL_PASSWORD'))
    mpesa_configured = bool(
        os.environ.get('MPESA_CONSUMER_KEY') and
        os.environ.get('MPESA_CONSUMER_SECRET') and
        os.environ.get('MPESA_PASSKEY') and
        os.environ.get('MPESA_SHORTCODE')
    )
    callback_url = os.environ.get('MPESA_CALLBACK_URL', '').strip()

    return jsonify({
        'debug_enabled': True,
        'debug_mode': bool(current_app.config.get('DEBUG')),
        'allow_debug_endpoints': True,
        'mail': {
            'configured': mail_configured,
            'suppress_send': current_app.config.get('MAIL_SUPPRESS_SEND', False),
            'server': current_app.config.get('MAIL_SERVER'),
            'port': current_app.config.get('MAIL_PORT'),
            'use_tls': current_app.config.get('MAIL_USE_TLS'),
            'use_ssl': current_app.config.get('MAIL_USE_SSL')
        },
        'mpesa': {
            'configured': mpesa_configured,
            'callback_url': callback_url,
            'oauth_url': os.environ.get('MPESA_OAUTH_URL', 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'),
            'stk_push_url': os.environ.get('MPESA_STK_PUSH_URL', 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest')
        }
    }), 200