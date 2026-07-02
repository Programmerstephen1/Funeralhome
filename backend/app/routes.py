import jwt
import datetime
import random # Added for OTP generation
from functools import wraps
from flask import Blueprint, jsonify, request, current_app
from .models import db, FuneralService, Tribute, User, Eulogy
from .mpesa import generate_stk_push_payload

api = Blueprint("api", __name__)

# --- SECURITY MIDDLEWARE ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
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
            return jsonify({"message": "Token is invalid or expired!"}), 401

        return f(current_user, *args, **kwargs)
    return decorated

# --- AUTHENTICATION ROUTES ---

@api.route("/api/auth/register", methods=["POST"])
def register():
    payload = request.get_json() or {}
    email = payload.get("email")
    password = payload.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    new_user = User(email=email)
    new_user.set_password(password)
    new_user.is_verified = False # PRO-GRADE: Force them through the OTP screen
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({"message": "User created successfully"}), 201

@api.route("/api/auth/login", methods=["POST"])
def login():
    payload = request.get_json() or {}
    email = payload.get("email")
    password = payload.get("password")

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
    email = payload.get("email")
    
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    otp_code = str(random.randint(100000, 999999))
    user.otp_code = otp_code
    user.otp_expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    db.session.commit()

    try:
        msg = Message(
            subject="Your Hollow Pine Verification Code",
            sender=("Hollow Pine Security", "itwikastephen1@gmail.com"),
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
                Welcome to Hollow Pine Memorial Hub. Please use the verification code below to securely access your account.
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
        print(f"Failed to send OTP email: {e}")
        return jsonify({"error": "Failed to send email. Please try again."}), 500

@api.route("/api/auth/verify-otp", methods=["POST"])
def verify_otp():
    payload = request.get_json() or {}
    email = payload.get("email")
    code = payload.get("code")

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
    email = payload.get("email")
    code = payload.get("code")
    new_password = payload.get("new_password")

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
    phone = payload.get("phone")
    email = payload.get("email") # Captures email from React client checkout layout
    
    if not amount or not phone:
        return jsonify({"error": "Amount and phone number are required."}), 400
        
    # Passes the user's email into our updated payload utility
    result = generate_stk_push_payload(amount, phone, email)
    
    if "error" in result:
        return jsonify(result), 500
        
    return jsonify(result), 200

@api.route("/api/payments/callback", methods=["POST"])
def mpesa_callback():
    from flask_mail import Message
    from . import mail
    
    try:
        data = request.get_json()
        
        # Extracts custom email metadata embedded into the URL parameter string
        customer_email = request.args.get("email") 
        
        callback_data = data.get("Body", {}).get("stkCallback", {})
        result_code = callback_data.get("ResultCode")
        
        if result_code == 0:
            # Payment Successful
            print("\n--- M-PESA SUCCESS ---")
            print("Callback Data:", callback_data)
            
            # Parses Safaricom's nested metadata container array safely
            metadata = callback_data.get("CallbackMetadata", {}).get("Item", [])
            receipt_no = next((item["Value"] for item in metadata if item["Name"] == "MpesaReceiptNumber"), "N/A")
            amount_paid = next((item["Value"] for item in metadata if item["Name"] == "Amount"), "N/A")
            
            # AUTOMATED TRANSACTION EMAIL ENGINERING
            if customer_email:
                try:
                    msg = Message(
                        subject="Your Payment Receipt - Hollow Pine Hub",
                        sender=("Hollow Pine Billing", "itwikastephen1@gmail.com"), 
                        recipients=[customer_email]
                    )
                    
                    msg.html = f"""
                    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; border: 1px solid #E8DFD1; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.03);">
                        <div style="background-color: #1F2E27; padding: 25px; text-align: center;">
                            <h1 style="color: #A8895C; margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 1px;">Hollow Pine</h1>
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
                            <p style="margin: 0;">Hollow Pine Funeral Home & Memorials • Kenya</p>
                        </div>
                    </div>
                    """
                    mail.send(msg)
                    print(f"[MAIL SYSTEM] Secure confirmation receipt sent straight to: {customer_email}")
                except Exception as mail_err:
                    print(f"[MAIL ERROR] Callback succeeded, but automated receipt transmission faulted: {mail_err}")
        else:
            # Payment Failed, Cancelled, or Timed Out
            print("\n--- M-PESA FAILED ---")
            print(f"Reason: {callback_data.get('ResultDesc')}")
            
        return jsonify({
            "ResultCode": 0, 
            "ResultDesc": "Callback processed successfully"
        }), 200

    except Exception as e:
        print(f"Error handling M-Pesa callback: {e}")
        return jsonify({"ResultCode": 1, "ResultDesc": "Callback processing failed"}), 500

# --- CONSULTATION EMAIL ROUTE ---
@api.route('/api/consultations', methods=['POST'])
def request_consultation():
    from flask_mail import Message
    from . import mail 
    
    data = request.json
    name = data.get('name')
    user_email = data.get('email')
    phone = data.get('phone')
    questions = data.get('questions', 'No questions provided.')

    try:
        msg = Message(
            subject=f"New Consultation Request: {name}",
            sender=(f"{name} via Hollow Pine", "itwikastephen1@gmail.com"), 
            recipients=["itwikastephen1@gmail.com"], 
            reply_to=(name, user_email) 
        )

        msg.body = f"""
        New Consultation Request from Hollow Pine Funeral Home:

        Name: {name}
        Email: {user_email}
        Phone: {phone}
        
        Questions/Notes:
        {questions}
        """

        msg.html = f"""
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E8DFD1; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: #1F2E27; padding: 30px 20px; text-align: center;">
                <h1 style="color: #A8895C; margin: 0; font-family: Georgia, serif; font-size: 28px; letter-spacing: 1px;">Hollow Pine</h1>
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
                <p style="margin: 0;">This is an automated notification from the Hollow Pine website.</p>
                <p style="margin: 5px 0 0 0;">Reply directly to this email to contact the family.</p>
            </div>
        </div>
        """

        mail.send(msg)
        return jsonify({"message": "Consultation request sent successfully!"}), 200

    except Exception as e:
        print(f"Failed to send email: {e}")
        return jsonify({"error": str(e)}), 500

def register_routes(app):
    app.register_blueprint(api)