"""Validate production service configuration without printing secret values.

Run without flags to check configuration only. Add --check-connectivity when
the environment is intentionally pointed at the target staging/production
services; this performs read-only database/Redis checks and a disposable
put/get/delete object-storage smoke check.
"""

from __future__ import annotations

import argparse
import hashlib
import os
import sys
import uuid
from urllib.parse import urlsplit

from dotenv import load_dotenv
from sqlalchemy import create_engine, text


REQUIRED_ENV = (
    "DATABASE_URL",
    "REDIS_URL",
    "SECRET_KEY",
    "JWT_SECRET_KEY",
    "FRONTEND_URL",
    "OBJECT_STORAGE_BUCKET",
    "OBJECT_STORAGE_ACCESS_KEY",
    "OBJECT_STORAGE_SECRET_KEY",
    "MAIL_SERVER",
    "MAIL_PORT",
    "MAIL_USE_SSL",
    "MAIL_USE_TLS",
    "MAIL_USERNAME",
    "MAIL_PASSWORD",
    "MAIL_DEFAULT_SENDER",
    "MPESA_CONSUMER_KEY",
    "MPESA_CONSUMER_SECRET",
    "MPESA_SHORTCODE",
    "MPESA_PASSKEY",
    "MPESA_CALLBACK_URL",
    "MPESA_CALLBACK_TOKEN",
    "SENTRY_DSN",
    "VITE_SENTRY_DSN",
)


def validate_configuration(environ: dict[str, str]) -> list[str]:
    """Return safe, non-secret configuration errors."""
    errors = [f"Missing required setting: {key}" for key in REQUIRED_ENV if not environ.get(key, "").strip()]

    database_url = environ.get("DATABASE_URL", "").strip()
    if database_url:
        scheme = urlsplit(database_url).scheme.lower()
        if scheme not in {"postgresql", "postgresql+psycopg2"}:
            errors.append("DATABASE_URL must use PostgreSQL")
        elif "sslmode=require" not in database_url.lower() and "sslmode=verify" not in database_url.lower():
            errors.append("DATABASE_URL must require TLS (sslmode=require or verify-full)")

    for key in ("FRONTEND_URL", "MPESA_CALLBACK_URL"):
        value = environ.get(key, "").strip()
        if value:
            parsed = urlsplit(value)
            if parsed.scheme != "https" or not parsed.netloc:
                errors.append(f"{key} must be an absolute HTTPS URL")
            if key == "FRONTEND_URL" and (parsed.path or parsed.query or parsed.fragment):
                errors.append("FRONTEND_URL must contain only the canonical origin")

    origins = [
        origin.strip()
        for origin in environ.get("CORS_ALLOWED_ORIGINS", "").split(",")
        if origin.strip()
    ]
    if "*" in origins:
        errors.append("CORS_ALLOWED_ORIGINS must not contain a wildcard")
    if any(urlsplit(origin).scheme != "https" for origin in origins):
        errors.append("Production CORS origins must use HTTPS")

    if environ.get("CSP_REPORT_ONLY", "true").strip().lower() in {"1", "true", "yes"}:
        errors.append("CSP_REPORT_ONLY must be disabled for production enforcement")
    if environ.get("FORCE_HTTPS", "true").strip().lower() not in {"1", "true", "yes"}:
        errors.append("FORCE_HTTPS must be enabled")
    if environ.get("ENABLE_HSTS", "true").strip().lower() not in {"1", "true", "yes"}:
        errors.append("ENABLE_HSTS must be enabled after HTTPS is verified")
    if (
        environ.get("MAIL_USE_SSL", "").strip().lower() in {"1", "true", "yes"}
        and environ.get("MAIL_USE_TLS", "").strip().lower() in {"1", "true", "yes"}
    ):
        errors.append("Configure exactly one of MAIL_USE_SSL and MAIL_USE_TLS")

    if environ.get("SECRET_KEY") and environ.get("JWT_SECRET_KEY"):
        if environ["SECRET_KEY"] == environ["JWT_SECRET_KEY"]:
            errors.append("SECRET_KEY and JWT_SECRET_KEY must be different")
        for key in ("SECRET_KEY", "JWT_SECRET_KEY", "MPESA_CALLBACK_TOKEN"):
            value = environ.get(key, "")
            if value and len(value) < 32:
                errors.append(f"{key} must contain at least 32 characters")

    return errors


def check_connectivity(environ: dict[str, str]) -> list[str]:
    """Check PostgreSQL, Redis, and private object storage without logging secrets."""
    failures: list[str] = []

    try:
        engine = create_engine(environ["DATABASE_URL"], pool_pre_ping=True, connect_args={"connect_timeout": 8})
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        engine.dispose()
        print("PASS: PostgreSQL connection and SELECT 1")
    except Exception as exc:  # Deliberately report class only; driver errors may include URLs.
        failures.append(f"PostgreSQL connection failed ({type(exc).__name__})")

    try:
        import redis

        if not redis.Redis.from_url(environ["REDIS_URL"], socket_connect_timeout=5).ping():
            raise RuntimeError("Redis ping returned false")
        print("PASS: Redis PING")
    except Exception as exc:
        failures.append(f"Redis connection failed ({type(exc).__name__})")

    object_key = f"health-checks/preflight-{uuid.uuid4().hex}.txt"
    body = b"funeralhome-production-preflight-v1"
    client = None
    uploaded = False
    try:
        import boto3

        client = boto3.client(
            "s3",
            endpoint_url=environ.get("OBJECT_STORAGE_ENDPOINT") or None,
            region_name=environ.get("OBJECT_STORAGE_REGION", "auto"),
            aws_access_key_id=environ["OBJECT_STORAGE_ACCESS_KEY"],
            aws_secret_access_key=environ["OBJECT_STORAGE_SECRET_KEY"],
        )
        bucket = environ["OBJECT_STORAGE_BUCKET"]
        client.put_object(Bucket=bucket, Key=object_key, Body=body, ContentType="text/plain")
        uploaded = True
        metadata = client.head_object(Bucket=bucket, Key=object_key)
        response = client.get_object(Bucket=bucket, Key=object_key)
        downloaded = response["Body"].read()
        if metadata.get("ContentLength") != len(body) or hashlib.sha256(downloaded).digest() != hashlib.sha256(body).digest():
            raise RuntimeError("Object verification mismatch")
        print("PASS: private object storage put/head/get and content verification")
    except Exception as exc:
        failures.append(f"Object storage smoke check failed ({type(exc).__name__})")
    finally:
        if client is not None and uploaded:
            try:
                client.delete_object(Bucket=environ["OBJECT_STORAGE_BUCKET"], Key=object_key)
                print("PASS: temporary object deleted")
            except Exception as exc:
                failures.append(f"Temporary object cleanup failed ({type(exc).__name__}); key is under health-checks/")

    return failures


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check-connectivity",
        action="store_true",
        help="Connect to configured services and create/delete a disposable object-storage test object.",
    )
    args = parser.parse_args()

    load_dotenv()
    environ = dict(os.environ)
    errors = validate_configuration(environ)
    if errors:
        for error in errors:
            print(f"FAIL: {error}")
        return 1
    print("PASS: required production settings, HTTPS, TLS, secrets, and security flags")

    if args.check_connectivity:
        errors = check_connectivity(environ)
        if errors:
            for error in errors:
                print(f"FAIL: {error}")
            return 1
    else:
        print("SKIP: service connectivity (rerun with --check-connectivity against the intended target)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
