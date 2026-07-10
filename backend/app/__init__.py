from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail
import os
from dotenv import load_dotenv

# Load variables from local .env file (Render will use actual OS environment variables)
load_dotenv()

db = SQLAlchemy()
mail = Mail() 

def create_app():
    # Define the path to the frontend 'dist' folder
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'))
    
    app = Flask(__name__, static_folder=frontend_dist, static_url_path='')
    
    # --- 🔒 PRO-GRADE STRICT CORS RULES ---
    # Only allow requests from your specific frontend URLs to prevent unauthorized access.
    # Replace 'your-frontend-name' with your actual Render URL.
    allowed_origins = [
        "https://your-frontend-name.onrender.com", 
        "http://localhost:5173"
    ]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    # --- 🟢 PRO-GRADE DATABASE ROUTER ---
    # Checks if a live cloud database URL is provided via Render Environment Variables.
    # If not, it safely falls back to local SQLite for development.
    raw_db_url = os.environ.get('DATABASE_URL')
    
    if raw_db_url:
        # SQLAlchemy requires 'postgresql://', but many cloud providers give 'postgres://'
        if raw_db_url.startswith("postgres://"):
            raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = raw_db_url
        print("🟢 CONNECTED: Live Cloud PostgreSQL Database")
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
        print("💻 CONNECTED: Local SQLite Database")

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super-secret-funeral-key')

    # --- Email Configuration (Forced SSL on Port 465 to bypass Render firewall) ---
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 465))

    # Respect the Render env vars for SSL/TLS rather than hard-coding port behavior.
    mail_use_tls = str(os.environ.get('MAIL_USE_TLS', 'False')).strip().lower() in ('1', 'true', 'yes')
    mail_use_ssl = str(os.environ.get('MAIL_USE_SSL', 'False')).strip().lower() in ('1', 'true', 'yes')
    app.config['MAIL_USE_TLS'] = mail_use_tls
    app.config['MAIL_USE_SSL'] = mail_use_ssl

    # Infer security transport from the SMTP port when TLS/SSL flags are omitted.
    if not mail_use_tls and not mail_use_ssl:
        if app.config['MAIL_PORT'] == 587:
            app.config['MAIL_USE_TLS'] = True
            print("INFO: MAIL_USE_TLS was inferred from port 587.")
        elif app.config['MAIL_PORT'] == 465:
            app.config['MAIL_USE_SSL'] = True
            print("INFO: MAIL_USE_SSL was inferred from port 465.")

    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    
    # Fallback to MAIL_USERNAME if MAIL_DEFAULT_SENDER isn't explicitly set
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER', os.environ.get('MAIL_USERNAME'))
    
    app.config['MAIL_DEBUG'] = True  # Prints raw email communication to Render/local logs
    # Allow disabling outbound email via environment variable in Render
    mss = os.environ.get('MAIL_SUPPRESS_SEND', '')
    app.config['MAIL_SUPPRESS_SEND'] = str(mss).strip().lower() in ('1', 'true', 'yes')

    if app.config['MAIL_SUPPRESS_SEND']:
        print("WARNING: MAIL_SUPPRESS_SEND is enabled. OTP and receipt emails will not be sent.")
    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
        print("WARNING: MAIL_USERNAME or MAIL_PASSWORD is missing. Email delivery will fail.")
    if app.config['MAIL_USE_SSL'] and app.config['MAIL_PORT'] != 465:
        print("WARNING: MAIL_USE_SSL is enabled but MAIL_PORT is not 465. Verify SMTP settings.")
    if app.config['MAIL_USE_TLS'] and app.config['MAIL_PORT'] != 587:
        print("WARNING: MAIL_USE_TLS is enabled but MAIL_PORT is not 587. Verify SMTP settings.")

    # Initialize extensions with the app
    db.init_app(app)
    mail.init_app(app)

    # Register routes
    from .routes import register_routes
    register_routes(app)

    # Serve the React App (Root route)
    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')

    # Catch-all for React Router (handles page refreshes)
    @app.route('/<path:path>')
    def serve_static(path):
        if os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        else:
            return send_from_directory(app.static_folder, 'index.html')

    # Initialize tables
    with app.app_context():
        from . import models
        try:
            db.create_all()
        except Exception as e:
            # Avoid hard crash if a table already exists or migrations ran separately
            # Log and continue so the app can start; the deployed DB should already have schema.
            import logging, traceback
            logging.getLogger(__name__).warning(f"db.create_all() raised an exception: {e}")
            logging.getLogger(__name__).debug(traceback.format_exc())

    return app