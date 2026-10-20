import os
import sys
import unittest


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from scripts.production_preflight import REQUIRED_ENV, validate_configuration


def valid_production_environment():
    values = {key: "configured-test-value-long-enough-for-validation" for key in REQUIRED_ENV}
    values.update(
        DATABASE_URL="postgresql://user:password@db.example.test/app?sslmode=require",
        REDIS_URL="redis://redis.example.test:6379/0",
        FRONTEND_URL="https://funeralhome.example.test",
        MPESA_CALLBACK_URL="https://funeralhome.example.test/api/payments/callback",
        SECRET_KEY="a" * 48,
        JWT_SECRET_KEY="b" * 48,
        MPESA_CALLBACK_TOKEN="c" * 48,
        FORCE_HTTPS="True",
        ENABLE_HSTS="True",
        CSP_REPORT_ONLY="False",
    )
    return values


class ProductionPreflightTests(unittest.TestCase):
    def test_valid_production_configuration_passes(self):
        self.assertEqual(validate_configuration(valid_production_environment()), [])

    def test_missing_integrations_are_reported_by_name_only(self):
        environment = valid_production_environment()
        environment["OBJECT_STORAGE_SECRET_KEY"] = ""
        environment["MPESA_PASSKEY"] = ""
        errors = validate_configuration(environment)
        self.assertIn("Missing required setting: OBJECT_STORAGE_SECRET_KEY", errors)
        self.assertIn("Missing required setting: MPESA_PASSKEY", errors)
        self.assertNotIn("configured-test-value", " ".join(errors))

    def test_rejects_non_tls_database_and_wildcard_cors(self):
        environment = valid_production_environment()
        environment["DATABASE_URL"] = "postgresql://user:password@db.example.test/app"
        environment["CORS_ALLOWED_ORIGINS"] = "*"
        errors = validate_configuration(environment)
        self.assertIn("DATABASE_URL must require TLS (sslmode=require or verify-full)", errors)
        self.assertIn("CORS_ALLOWED_ORIGINS must not contain a wildcard", errors)

    def test_requires_enforced_security_controls(self):
        environment = valid_production_environment()
        environment["CSP_REPORT_ONLY"] = "True"
        environment["FORCE_HTTPS"] = "False"
        environment["ENABLE_HSTS"] = "False"
        environment["MAIL_USE_SSL"] = "True"
        environment["MAIL_USE_TLS"] = "True"
        errors = validate_configuration(environment)
        self.assertIn("CSP_REPORT_ONLY must be disabled for production enforcement", errors)
        self.assertIn("FORCE_HTTPS must be enabled", errors)
        self.assertIn("ENABLE_HSTS must be enabled after HTTPS is verified", errors)
        self.assertIn("Configure exactly one of MAIL_USE_SSL and MAIL_USE_TLS", errors)


if __name__ == "__main__":
    unittest.main()
