import os
import re
import sys
import unittest
from unittest.mock import patch


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ["DATABASE_URL"] = "sqlite://"

from app import create_app, db, limiter
from app.models import AuthChallenge, PaymentTransaction, User


class AccountLifecycleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.app.config.update(
            TESTING=True,
            JWT_SECRET_KEY="test-jwt-secret-that-is-long-enough-for-tests",
            MAIL_USERNAME="test@example.test",
            MAIL_PASSWORD="test-only-password",
            MAIL_SUPPRESS_SEND=False,
        )

    def setUp(self):
        with self.app.app_context():
            db.drop_all()
            db.create_all()
        limiter.reset()
        self.client = self.app.test_client()
        self.sent_messages = []
        self.mail_patch = patch("app.routes.send_mail_message", side_effect=self._capture_mail)
        self.mail_patch.start()
        self.addCleanup(self.mail_patch.stop)

    def _capture_mail(self, message, _mail):
        self.sent_messages.append(message)
        return True

    def _last_code(self):
        match = re.search(r"<strong>(\d{6})</strong>", self.sent_messages[-1].html)
        self.assertIsNotNone(match, "OTP email should contain a six-digit code")
        return match.group(1)

    def test_health_and_products_api_routes_are_registered(self):
        health = self.client.get("/api/health")
        self.assertEqual(health.status_code, 200, health.get_json())
        self.assertEqual(health.get_json(), {"status": "ok", "database": "ok"})

        readiness = self.client.get("/api/health/ready")
        self.assertEqual(readiness.status_code, 200, readiness.get_json())
        self.assertEqual(readiness.get_json(), {"status": "ready"})

        products = self.client.get("/api/products")
        self.assertEqual(products.status_code, 200, products.get_json())
        self.assertIsInstance(products.get_json(), list)

    def test_public_runtime_config_exposes_only_browser_safe_sentry_value(self):
        with patch.dict(os.environ, {"VITE_SENTRY_DSN": "https://public@example.ingest.sentry.io/1"}):
            response = self.client.get("/api/config/public")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json(), {"sentryDsn": "https://public@example.ingest.sentry.io/1"})
        self.assertEqual(response.headers["Cache-Control"], "no-store")

    def test_unknown_frontend_path_returns_http_404(self):
        response = self.client.get("/this-page-does-not-exist")
        self.assertEqual(response.status_code, 404)

    def test_production_http_request_redirects_to_configured_https_origin(self):
        self.app.config.update(FORCE_HTTPS=True, PUBLIC_ORIGIN="https://example.test")
        try:
            response = self.client.get("/plan?source=qr")
            self.assertEqual(response.status_code, 308)
            self.assertEqual(response.headers["Location"], "https://example.test/plan?source=qr")
        finally:
            self.app.config.update(FORCE_HTTPS=False, PUBLIC_ORIGIN="")

    def test_production_rejects_sqlite_database_urls(self):
        with patch.dict(
            os.environ,
            {
                "APP_ENV": "production",
                "RENDER": "",
                "SECRET_KEY": "production-test-secret",
                "JWT_SECRET_KEY": "production-test-jwt-secret",
                "DATABASE_URL": "sqlite:///not-durable.db",
            },
        ):
            with self.assertRaisesRegex(RuntimeError, "managed PostgreSQL"):
                create_app()

    def _register(self, email="family@example.com", password="safe-pass-123"):
        response = self.client.post("/api/auth/register", json={"email": email, "password": password})
        self.assertEqual(response.status_code, 201, response.get_json())
        return self._last_code()

    def _verify(self, email, code):
        return self.client.post("/api/auth/verify-otp", json={"email": email, "code": code})

    def test_register_verify_login_and_single_use_code(self):
        code = self._register(" FAMILY@EXAMPLE.COM ")
        self.assertEqual(self.client.post("/api/auth/login", json={"email": "family@example.com", "password": "safe-pass-123"}).status_code, 403)
        self.assertEqual(self._verify("family@example.com", "000000").status_code, 400)
        verified = self._verify("family@example.com", code)
        self.assertEqual(verified.status_code, 200, verified.get_json())
        self.assertEqual(self._verify("family@example.com", code).status_code, 409)
        login = self.client.post("/api/auth/login", json={"email": "family@example.com", "password": "safe-pass-123"})
        self.assertEqual(login.status_code, 200, login.get_json())
        self.assertEqual(login.get_json()["email"], "family@example.com")
        self.assertTrue(login.get_json().get("token"))

    def test_reset_code_is_separate_from_verification_and_replaces_password(self):
        verify_code = self._register()
        self._verify("family@example.com", verify_code)
        response = self.client.post("/api/auth/send-otp", json={"email": "family@example.com", "purpose": "reset"})
        self.assertEqual(response.status_code, 202)
        reset_code = self._last_code()
        self.assertNotEqual(self.sent_messages[-1].subject, self.sent_messages[0].subject)
        reset = self.client.post("/api/auth/reset-password", json={
            "email": "family@example.com", "code": reset_code, "new_password": "new-safe-pass-456"
        })
        self.assertEqual(reset.status_code, 200, reset.get_json())
        self.assertEqual(self.client.post("/api/auth/login", json={"email": "family@example.com", "password": "safe-pass-123"}).status_code, 401)
        self.assertEqual(self.client.post("/api/auth/login", json={"email": "family@example.com", "password": "new-safe-pass-456"}).status_code, 200)
        self.assertEqual(self.client.post("/api/auth/reset-password", json={
            "email": "family@example.com", "code": reset_code, "new_password": "another-safe-pass"
        }).status_code, 400)

    def test_reset_request_does_not_reveal_unknown_accounts(self):
        known = self.client.post("/api/auth/send-otp", json={"email": "family@example.com", "purpose": "reset"})
        self.assertEqual(known.status_code, 202)
        unknown = self.client.post("/api/auth/send-otp", json={"email": "nobody@example.com", "purpose": "reset"})
        self.assertEqual(unknown.status_code, 202)
        self.assertEqual(known.get_json(), unknown.get_json())
        self.assertEqual(len(self.sent_messages), 0)

    def test_failed_email_delivery_is_not_reported_as_sent(self):
        with patch("app.routes.send_mail_message", return_value=False):
            response = self.client.post("/api/auth/register", json={"email": "pending@example.com", "password": "safe-pass-123"})
        self.assertEqual(response.status_code, 202)
        self.assertFalse(response.get_json()["verification_sent"])
        with self.app.app_context():
            self.assertEqual(AuthChallenge.query.count(), 0)
            self.assertIsNotNone(User.query.filter_by(email="pending@example.com").first())
        resend = self.client.post("/api/auth/send-otp", json={"email": "pending@example.com", "purpose": "verify"})
        self.assertEqual(resend.status_code, 200)

    def test_missing_mail_credentials_are_reported_and_reset_does_not_leak_accounts(self):
        username, password = self.app.config["MAIL_USERNAME"], self.app.config["MAIL_PASSWORD"]
        self.app.config["MAIL_USERNAME"] = None
        self.app.config["MAIL_PASSWORD"] = None
        try:
            registration = self.client.post("/api/auth/register", json={"email": "pending@example.com", "password": "safe-pass-123"})
            self.assertEqual(registration.status_code, 202)
            self.assertFalse(registration.get_json()["verification_sent"])
            known = self.client.post("/api/auth/send-otp", json={"email": "pending@example.com", "purpose": "reset"})
            unknown = self.client.post("/api/auth/send-otp", json={"email": "unknown@example.com", "purpose": "reset"})
            self.assertEqual(known.status_code, 503)
            self.assertEqual(known.get_json(), unknown.get_json())
        finally:
            self.app.config["MAIL_USERNAME"] = username
            self.app.config["MAIL_PASSWORD"] = password

    def test_verification_attempts_are_limited(self):
        code = self._register()
        for _ in range(5):
            self.assertEqual(self._verify("family@example.com", "999999").status_code, 400)
        self.assertEqual(self._verify("family@example.com", code).status_code, 400)
        self.assertEqual(self.client.post("/api/auth/send-otp", json={"email": "family@example.com", "purpose": "verify"}).status_code, 200)
        self.assertEqual(self._verify("family@example.com", self._last_code()).status_code, 200)

    def test_password_update_requires_current_password_and_accepts_new_password(self):
        code = self._register()
        self._verify("family@example.com", code)
        login = self.client.post("/api/auth/login", json={"email": "family@example.com", "password": "safe-pass-123"}).get_json()
        headers = {"Authorization": f"Bearer {login['token']}"}
        wrong_current = self.client.put("/api/user/password", json={
            "current_password": "incorrect", "password": "new-safe-pass-456"
        }, headers=headers)
        self.assertEqual(wrong_current.status_code, 400)
        updated = self.client.put("/api/user/password", json={
            "current_password": "safe-pass-123", "password": "new-safe-pass-456"
        }, headers=headers)
        self.assertEqual(updated.status_code, 200, updated.get_json())

    def test_profile_update_and_account_delete_remove_auth_state(self):
        code = self._register()
        self._verify("family@example.com", code)
        login = self.client.post("/api/auth/login", json={"email": "family@example.com", "password": "safe-pass-123"}).get_json()
        headers = {"Authorization": f"Bearer {login['token']}"}
        update = self.client.put("/api/user/profile", json={"first_name": "Family", "phone": "+254700000000"}, headers=headers)
        self.assertEqual(update.status_code, 200, update.get_json())
        with self.app.app_context():
            db.session.add(PaymentTransaction(email="family@example.com", phone="+254700000000", amount=500.0, status="completed"))
            db.session.commit()
        profile = self.client.get("/api/user/profile", headers=headers).get_json()
        self.assertEqual(profile["first_name"], "Family")
        self.assertEqual(profile["phone"], "+254700000000")
        delete = self.client.delete("/api/user/account", headers=headers)
        self.assertEqual(delete.status_code, 200, delete.get_json())
        with self.app.app_context():
            self.assertIsNone(User.query.filter_by(email="family@example.com").first())
            self.assertEqual(AuthChallenge.query.count(), 0)
            retained_payment = PaymentTransaction.query.one()
            self.assertTrue(retained_payment.email.endswith("@deleted.invalid"))
            self.assertIsNone(retained_payment.phone)
        self.assertEqual(self.client.get("/api/user/profile", headers=headers).status_code, 404)


if __name__ == "__main__":
    unittest.main()
