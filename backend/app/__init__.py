from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail
import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

db = SQLAlchemy()
# 1. Initialize Mail globally just like the DB
mail = Mail() 

def create_app():
    # Define the path to the frontend 'dist' folder
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'))
    
    app = Flask(__name__, static_folder=frontend_dist, static_url_path='')
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Database and Security Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'super-secret-funeral-key')

    # 2. Email Configuration (Flask-Mail)
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS') == 'True'
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')
    app.config['MAIL_DEBUG'] = True  # This prints the raw email communication
    app.config['MAIL_SUPPRESS_SEND'] = False
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
        db.create_all()

    return app