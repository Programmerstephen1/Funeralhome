import jwt
import datetime
import random
import logging
import re
import os
from functools import wraps
from flask import Blueprint, jsonify, request, current_app
from .models import db, FuneralService, Tribute, User, Eulogy, Consultation
from .mpesa import generate_stk_push_payload

# --- INITIALIZE PRO-GRADE LOGGER ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api = Blueprint("api", __name__)

# --- SECURITY MIDDLEWARE ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"message": "Security token is missing!"}), 401

        try:
            secret = current_app.config.get('SECRET_KEY', 'super-secret-funeral-key')
            data = jwt.decode(token, secret, algorithms=["HS256"])
            current_user = User.query.get(data["user_id"])
            if not current_user:
                raise Exception("User not found")
        except Exception as e:
            logger.error(f"Token error: {e}")
            return jsonify({"message": "Token is invalid or expired!"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# --- AUTHENTICATION ROUTES ---

@api.route("/api/auth/register", methods=["POST"])
def register():
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

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201

@api.route("/api/auth/login", methods=["POST"])
def login():
    payload = request.get_json() or {}
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        secret = current_app.config.get('SECRET_KEY', 'super-secret-funeral-key')
        token = jwt.encode({
            "user_id": user.id,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, secret, algorithm="HS256")
        
        return jsonify({
            "token": token,
            "is_verified": user.is_verified # Frontend uses this to route correctly
        }), 200

    return jsonify({"message": "Invalid email or password"}), 401

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
            subject="Your last planner julz Hub Verification Code",
            sender=("last planner julz Hub Security", "stephenitwika178@gmail.com"),
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
                Welcome to last planner julz Hub. Please use the verification code below to securely access your account.
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
        # Returns the exact stringified error to your browser's Network tab for instant debugging
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
@token_required
def list_tributes(current_user):
    tributes = Tribute.query.filter_by(user_id=current_user.id).limit(10).all()
    return jsonify([t.to_dict() for t in tributes])

@api.route("/api/tributes", methods=["POST"])
@token_required
def create_tribute(current_user):
    payload = request.get_json() or {}
    tribute = Tribute(
        name=payload.get("name", "Anonymous"),
        message=payload.get("message", ""),
        user_id=current_user.id
    )
    db.session.add(tribute)
    db.session.commit()
    return jsonify(tribute.to_dict()), 201

# --- EULOGY ROUTES ---

@api.route("/api/eulogies", methods=["POST"])
@token_required
def create_eulogy(current_user):
    payload = request.get_json() or {}
    
    try:
        new_eulogy = Eulogy(
            deceased_name=payload.get("deceased_name"),
            birth_year=payload.get("birth_year"),
            passing_year=payload.get("passing_year"),
            occupation=payload.get("occupation"),
            interests=payload.get("interests"),
            personality=payload.get("personality"),
            user_id=current_user.id
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

    # Persist a lightweight transaction record so callbacks can be correlated
    try:
        from .models import PaymentTransaction
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


@api.route("/api/payments/mock", methods=["POST"])
def mock_payment():
    """A simple mock payment endpoint for deployments where M-Pesa is unavailable.
    Records the request in logs and returns a fake success payload.
    """
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

    # Return a deterministic fake transaction id
    tx_id = f"MOCK-{int(datetime.datetime.utcnow().timestamp())}"
    return jsonify({"message": "Mock payment processed", "transaction_id": tx_id}), 200

@api.route("/api/payments/callback", methods=["POST"])
def mpesa_callback():
    from flask_mail import Message
    from . import mail
    
    try:
        data = request.get_json()
        # First try to get the email from the query string (if callback URL contained it)
        customer_email = request.args.get("email") 

        callback_data = data.get("Body", {}).get("stkCallback", {})
        result_code = callback_data.get("ResultCode")
        
        # Attempt to correlate callback with an initiated transaction if email missing
        if not customer_email:
            try:
                from .models import PaymentTransaction
                # Many callbacks include CheckoutRequestID
                checkout_id = callback_data.get("CheckoutRequestID") or data.get("Body", {}).get("stkCallback", {}).get("CheckoutRequestID")
                if checkout_id:
                    tx = PaymentTransaction.query.filter_by(checkout_request_id=checkout_id).first()
                    if tx and tx.email:
                        customer_email = tx.email
                        tx.status = 'completed'
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
                        subject="Your Payment Receipt - last planner julz Hub",
                        sender=("Last planner julz Hub", "stephenitwika178@gmail.com"), 
                        recipients=[customer_email]
                    )
                    
                    msg.html = f"""
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #E8DFD1; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.03);">
                        <div style="background-color: #1F2E27; padding: 25px; text-align: center;">
                            <h1 style="color: #A8895C; margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 1px;">last planner julz Hub</h1>
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
                            <p style="margin: 0;">last planner julz Hub • Kenya</p>
                        </div>
                    </div>
                    """
                    mail.send(msg)
                    logger.info(f"[MAIL SYSTEM] Secure confirmation receipt sent straight to: {customer_email}")
                except Exception as mail_err:
                    logger.error(f"[MAIL ERROR] Callback succeeded, but automated receipt transmission faulted: {mail_err}")
        else:
            logger.error(f"--- M-PESA FAILED --- Reason: {callback_data.get('ResultDesc')}")
            
        return jsonify({
            "ResultCode": 0, 
            "ResultDesc": "Callback processed successfully"
        }), 200

    except Exception as e:
        logger.exception("Error handling M-Pesa callback")
        return jsonify({"ResultCode": 1, "ResultDesc": "Callback processing failed", "error": str(e)}), 500

# --- CONSULTATION EMAIL ROUTE ---
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
        # Persist the consultation so requests are not lost even if email fails
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
            sender=(f"{name} via last planner julz Hub", mail_username), 
            recipients=[mail_username],
            reply_to=(name, user_email) 
        )

        msg.html = f"""
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E8DFD1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: #1F2E27; padding: 30px 20px; text-align: center;">
                <h1 style="color: #A8895C; margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 1px;">last planner julz Hub</h1>
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
                <p style="margin: 0;">This is an automated notification from the last planner julz Hub website.</p>
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

    # 🟢 PRO-GRADE FIX: Allow API access from frontend across environments.
    # Using a resource wildcard here keeps local development working while
    # allowing the deployed frontend origin to call the API without 500-level CORS failures.
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    app.register_blueprint(api)


@api.route('/api/debug/payment-transactions', methods=['GET'])
def debug_payment_transactions():
    """Return recent PaymentTransaction records for debugging.
    Enabled only when `DEBUG` is True or when ALLOW_DEBUG_ENDPOINTS is set in environment.
    """
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