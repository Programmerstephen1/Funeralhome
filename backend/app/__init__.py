from flask import Flask, jsonify, redirect, request, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail
import os
import secrets
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.exceptions import NotFound
from sqlalchemy import text
from urllib.parse import urlsplit, urlunsplit

load_dotenv()

db = SQLAlchemy()
try:
    from flask_migrate import Migrate
    migrate = Migrate()
except ImportError:  # Lightweight developer environments can run the app without migration commands.
    migrate = None
mail = Mail() 
limiter = Limiter(key_func=get_remote_address, default_limits=[])


def validate_required_env(app):
    missing_secrets = [key for key in ('SECRET_KEY', 'JWT_SECRET_KEY') if not os.environ.get(key)]
    production = bool(os.environ.get('RENDER')) or os.environ.get('APP_ENV', '').lower() == 'production'
    app.config['FORCE_HTTPS'] = production and os.environ.get('FORCE_HTTPS', 'True').strip().lower() in ('1', 'true', 'yes')
    app.config['PUBLIC_ORIGIN'] = os.environ.get('FRONTEND_URL', '').strip().rstrip('/')
    if production and missing_secrets:
        raise RuntimeError(f"Missing required production secrets: {', '.join(missing_secrets)}")
    if production:
        origin = urlsplit(app.config['PUBLIC_ORIGIN'])
        if origin.scheme != 'https' or not origin.netloc or origin.path or origin.query or origin.fragment:
            raise RuntimeError('FRONTEND_URL must be the canonical HTTPS origin in production.')
    if missing_secrets:
        app.logger.warning("Using temporary process secrets for local development; configure SECRET_KEY and JWT_SECRET_KEY for stable sessions.")


def scrub_sentry_event(event, _hint=None):
    """Remove user, request, URL, and exception-message data from telemetry."""
    event.pop('user', None)
    event.pop('extra', None)
    event.pop('message', None)
    for exception in event.get('exception', {}).get('values', []):
        exception['value'] = exception.get('type', 'Exception')
    request_data = event.get('request')
    if isinstance(request_data, dict):
        for key in ('data', 'headers', 'cookies', 'query_string', 'fragment'):
            request_data.pop(key, None)
        request_url = request_data.get('url')
        if request_url:
            parts = urlsplit(request_url)
            request_data['url'] = urlunsplit((parts.scheme, parts.netloc, '/[redacted]', '', ''))
    return event


def initialize_error_monitoring(app):
    """Enable Sentry only when configured, with sensitive request data removed."""
    dsn = os.environ.get('SENTRY_DSN', '').strip()
    if not dsn:
        return

    import sentry_sdk
    from sentry_sdk.integrations.flask import FlaskIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

    sentry_sdk.init(
        dsn=dsn,
        environment=os.environ.get('SENTRY_ENVIRONMENT', app.config.get('ENV', 'production')),
        release=os.environ.get('SENTRY_RELEASE'),
        send_default_pii=False,
        traces_sample_rate=0.0,
        integrations=[FlaskIntegration(), SqlalchemyIntegration()],
        before_send=scrub_sentry_event,
    )


def create_app():
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'frontend', 'dist'))
    
    app = Flask(__name__, static_folder=frontend_dist, static_url_path='')

    # Trust forwarded client/protocol headers only from the configured proxy
    # chain. Host, port, and prefix headers are deliberately never trusted.
    proxy_hops = int(os.environ.get('TRUSTED_PROXY_HOPS', '0'))
    if proxy_hops < 0 or proxy_hops > 5:
        raise RuntimeError('TRUSTED_PROXY_HOPS must be between 0 and 5.')
    app.wsgi_app = ProxyFix(
        app.wsgi_app,
        x_for=proxy_hops,
        x_proto=proxy_hops,
        x_host=0,
        x_port=0,
        x_prefix=0,
    )
    
    production = bool(os.environ.get('RENDER')) or os.environ.get('APP_ENV', '').lower() == 'production'
    allowed_origins = [
        os.environ.get('FRONTEND_URL', '').strip().rstrip('/'),
        *[
            origin.strip().rstrip('/')
            for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',')
            if origin.strip()
        ],
    ]
    if not production:
        allowed_origins.extend([
            'http://localhost:5173', 'http://localhost:4173',
            'http://127.0.0.1:5173', 'http://127.0.0.1:4173',
        ])
    allowed_origins = list(dict.fromkeys(origin for origin in allowed_origins if origin))
    app.config['CORS_ALLOWED_ORIGINS'] = allowed_origins
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    raw_db_url = os.environ.get('DATABASE_URL')
    
    if raw_db_url:
        if raw_db_url.startswith("postgres://"):
            raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)
        database_scheme = raw_db_url.split(":", 1)[0].lower()
        if production and database_scheme not in {"postgresql", "postgresql+psycopg2"}:
            raise RuntimeError("DATABASE_URL must use managed PostgreSQL in production; SQLite is not durable.")
        app.config['SQLALCHEMY_DATABASE_URI'] = raw_db_url
        print(f"CONNECTED: Configured {database_scheme} database")
    else:
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
        print("CONNECTED: Local SQLite Database")

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024
    app.config['MAX_UPLOAD_BYTES'] = int(os.environ.get('MAX_UPLOAD_BYTES', str(8 * 1024 * 1024)))
    app.config['MAX_UPLOAD_PIXELS'] = int(os.environ.get('MAX_UPLOAD_PIXELS', '25000000'))
    app.config['OBJECT_STORAGE_BUCKET'] = os.environ.get('OBJECT_STORAGE_BUCKET', '').strip()
    app.config['OBJECT_STORAGE_ENDPOINT'] = os.environ.get('OBJECT_STORAGE_ENDPOINT', '').strip() or None
    app.config['OBJECT_STORAGE_REGION'] = os.environ.get('OBJECT_STORAGE_REGION', 'auto').strip()
    app.config['OBJECT_STORAGE_ACCESS_KEY'] = os.environ.get('OBJECT_STORAGE_ACCESS_KEY', '').strip()
    app.config['OBJECT_STORAGE_SECRET_KEY'] = os.environ.get('OBJECT_STORAGE_SECRET_KEY', '').strip()
    app.config['OBJECT_STORAGE_SSE'] = os.environ.get('OBJECT_STORAGE_SSE', '').strip()
    app.config['OBJECT_STORAGE_URL_TTL'] = int(os.environ.get('OBJECT_STORAGE_URL_TTL', '300'))
    app.config['MPESA_CALLBACK_TOKEN'] = os.environ.get('MPESA_CALLBACK_TOKEN', '').strip()
    redis_url = os.environ.get('REDIS_URL', '').strip()
    if production and not raw_db_url:
        raise RuntimeError('DATABASE_URL is required in production; SQLite container storage is not durable.')
    if production and not redis_url:
        raise RuntimeError('REDIS_URL is required in production for shared rate limiting.')
    if production and not all((app.config['OBJECT_STORAGE_BUCKET'], app.config['OBJECT_STORAGE_ACCESS_KEY'], app.config['OBJECT_STORAGE_SECRET_KEY'])):
        raise RuntimeError('Private object storage bucket and credentials are required in production.')
    if production and not app.config['MPESA_CALLBACK_TOKEN']:
        raise RuntimeError('MPESA_CALLBACK_TOKEN is required in production to authenticate payment callbacks.')
    app.config['RATELIMIT_STORAGE_URI'] = redis_url or 'memory://'
    app.config['RATELIMIT_HEADERS_ENABLED'] = True
    
    # PRO-GRADE FIX: Prevents "SSL connection closed unexpectedly" errors from the database
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {"pool_pre_ping": True}
    
    # --- SECURITY & JWT CONFIGURATION ---
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or secrets.token_urlsafe(48)
    
    # PRO-GRADE FIX: Extended the default JWT string to >32 characters to clear the PyJWT Warning
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or secrets.token_urlsafe(48)
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

    # Keep provider credentials server-side. Never mirror LLM_API_KEY into VITE_*.
    app.config['LLM_API_URL'] = os.environ.get('LLM_API_URL', '').strip()
    app.config['LLM_API_KEY'] = os.environ.get('LLM_API_KEY', '').strip()
    app.config['LLM_MODEL'] = os.environ.get('LLM_MODEL', '').strip()
    
    app.config['MAIL_DEBUG'] = False
    mss = os.environ.get('MAIL_SUPPRESS_SEND', '')
    app.config['MAIL_SUPPRESS_SEND'] = str(mss).strip().lower() in ('1', 'true', 'yes')

    app.config['CSP_REPORT_ONLY'] = os.environ.get('CSP_REPORT_ONLY', 'True').strip().lower() in ('1', 'true', 'yes')
    app.config['ENABLE_HSTS'] = os.environ.get('ENABLE_HSTS', 'False').strip().lower() in ('1', 'true', 'yes')

    @app.before_request
    def require_https_in_production():
        if app.config['FORCE_HTTPS'] and not request.is_secure:
            query = f"?{request.query_string.decode('utf-8')}" if request.query_string else ''
            return redirect(f"{app.config['PUBLIC_ORIGIN']}{request.path}{query}", code=308)

    validate_required_env(app)
    initialize_error_monitoring(app)

    if app.config['MAIL_SUPPRESS_SEND']:
        print("WARNING: MAIL_SUPPRESS_SEND is enabled. OTP and receipt emails will not be sent.")
    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
        print("WARNING: MAIL_USERNAME or MAIL_PASSWORD is missing. Email delivery will fail.")

    db.init_app(app)
    if migrate:
        migrate.init_app(app, db, directory=os.path.join(os.path.dirname(__file__), '..', 'migrations'))
    mail.init_app(app)
    limiter.init_app(app)
    jwt = JWTManager(app) 

    @app.errorhandler(429)
    def rate_limit_exceeded(_error):
        response = jsonify({"message": "Too many attempts. Please wait before trying again."})
        response.headers['Retry-After'] = '60'
        return response, 429

    @app.after_request
    def add_security_headers(response):
        response.headers.setdefault('X-Content-Type-Options', 'nosniff')
        response.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
        response.headers.setdefault('X-Frame-Options', 'DENY')
        response.headers.setdefault('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

        # Start in report-only mode while OAuth and payment dependencies are inventoried.
        csp = (
            "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; "
            "img-src 'self' data: blob: https:; font-src 'self' data: https:; "
            "style-src 'self' 'unsafe-inline' https:; "
            "script-src 'self' https://accounts.google.com; "
            "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io; "
            "frame-src 'self' https://accounts.google.com; "
            "form-action 'self' https://www.facebook.com https://twitter.com https://accounts.google.com"
        )
        csp_header = 'Content-Security-Policy-Report-Only' if app.config['CSP_REPORT_ONLY'] else 'Content-Security-Policy'
        response.headers.setdefault(csp_header, csp)

        if app.config['ENABLE_HSTS']:
            response.headers.setdefault('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        return response

    from .routes import register_routes
    register_routes(app)

    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/api/health/live', methods=['GET'])
    def liveness_check():
        return jsonify({"status": "ok"}), 200

    @app.route('/api/config/public', methods=['GET'])
    def public_runtime_config():
        """Expose only browser-safe settings that are supplied at container runtime."""
        response = jsonify({"sentryDsn": os.environ.get('VITE_SENTRY_DSN', '').strip()})
        response.headers['Cache-Control'] = 'no-store'
        return response, 200

    @app.route('/api/health/ready', methods=['GET'])
    def readiness_check():
        try:
            db.session.execute(text('SELECT 1'))
            limiter.storage.check()
            return jsonify({"status": "ready"}), 200
        except Exception:
            app.logger.exception('Readiness check failed')
            return jsonify({"status": "not_ready"}), 503

    @app.route('/static/uploads/<path:filename>', methods=['GET'])
    def private_upload_redirect(filename):
        from .models import UploadedFile
        from .storage import signed_get_url
        import re
        if not re.fullmatch(r'[A-Za-z0-9._-]{1,100}', filename):
            return jsonify({"error": "Image not found"}), 404
        if not UploadedFile.query.filter_by(filename=filename).first():
            return jsonify({"error": "Image not found"}), 404
        try:
            return redirect(signed_get_url(filename), code=302)
        except Exception:
            app.logger.exception('Private image URL could not be created')
            return jsonify({"error": "Image storage is temporarily unavailable"}), 503

    @app.route('/<path:path>')
    def serve_static(path):
        if path == 'api' or path.startswith('api/'):
            return jsonify({"error": "API endpoint not found"}), 404
        try:
            return send_from_directory(app.static_folder, path)
        except NotFound:
            pass

        known_routes = {
            'plan', 'packages', 'obituaries', 'catalog', 'cart', 'checkout',
            'booking-checkout', 'thankyou', 'thank-you', 'bookings', 'admin', 'memorial',
            'settings', 'login', 'register', 'verify', 'forgot-password',
            'reset-password', 'privacy', 'terms', 'refunds',
        }
        route_is_known = path in known_routes or any(
            path.startswith(prefix) for prefix in (
                'product/', 'catalog/', 'section/', 'memorial/', 'overview/',
                'wall/', 'pages/', 'gallery/', 'flowers/', 'candles/',
                'family/', 'tree/', 'journal/', 'eulogy/',
            )
        )
        response = send_from_directory(app.static_folder, 'index.html')
        response.status_code = 200 if route_is_known else 404
        return response

    @app.errorhandler(413)
    def request_too_large(_error):
        max_upload_mb = max(1, app.config['MAX_UPLOAD_BYTES'] // (1024 * 1024))
        return jsonify({"error": f"The uploaded file is too large. Choose an image no larger than {max_upload_mb} MB."}), 413

    return app
