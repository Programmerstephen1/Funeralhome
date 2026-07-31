from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail
import os
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

load_dotenv()

db = SQLAlchemy()
mail = Mail() 

def create_app():
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'))
    
    app = Flask(__name__, static_folder=frontend_dist, static_url_path='')
    
    allowed_origins = [
        "https://your-frontend-name.onrender.com", 
        "http://localhost:5173",
        "http://localhost:4173" 
    ]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    raw_db_url = os.environ.get('DATABASE_URL')
    
    if raw_db_url:
        if raw_db_url.startswith("postgres://"):
            raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = raw_db_url
        print("CONNECTED: Live Cloud PostgreSQL Database")
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
        print("CONNECTED: Local SQLite Database")

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # PRO-GRADE FIX: Prevents "SSL connection closed unexpectedly" errors from the database
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {"pool_pre_ping": True}
    
    # --- SECURITY & JWT CONFIGURATION ---
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super-secret-funeral-key')
    
    # PRO-GRADE FIX: Extended the default JWT string to >32 characters to clear the PyJWT Warning
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'secure-jwt-key-for-last-planner-hub-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400 
    
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 465))

    mail_use_tls = str(os.environ.get('MAIL_USE_TLS', 'False')).strip().lower() in ('1', 'true', 'yes')
    mail_use_ssl = str(os.environ.get('MAIL_USE_SSL', 'False')).strip().lower() in ('1', 'true', 'yes')
    app.config['MAIL_USE_TLS'] = mail_use_tls
    app.config['MAIL_USE_SSL'] = mail_use_ssl

    if not mail_use_tls and not mail_use_ssl:
        if app.config['MAIL_PORT'] == 587:
            app.config['MAIL_USE_TLS'] = True
            print("INFO: MAIL_USE_TLS was inferred from port 587.")
        elif app.config['MAIL_PORT'] == 465:
            app.config['MAIL_USE_SSL'] = True
            print("INFO: MAIL_USE_SSL was inferred from port 465.")

    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', os.environ.get('MAIL_USERNAME'))
    
    app.config['MAIL_DEBUG'] = True 
    mss = os.environ.get('MAIL_SUPPRESS_SEND', '')
    app.config['MAIL_SUPPRESS_SEND'] = str(mss).strip().lower() in ('1', 'true', 'yes')

    if app.config['MAIL_SUPPRESS_SEND']:
        print("WARNING: MAIL_SUPPRESS_SEND is enabled. OTP and receipt emails will not be sent.")
    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
        print("WARNING: MAIL_USERNAME or MAIL_PASSWORD is missing. Email delivery will fail.")

    db.init_app(app)
    mail.init_app(app)
    jwt = JWTManager(app) 

    from .routes import register_routes
    register_routes(app)

    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        if os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    with app.app_context():
        from . import models
        try:
            db.create_all()
        except Exception as e:
            import logging, traceback
            logging.getLogger(__name__).warning(f"db.create_all() raised an exception: {e}")
            logging.getLogger(__name__).debug(traceback.format_exc())

    return app