"""Private S3-compatible object storage for user supplied media.

Objects are never made public. The API redirects known, unguessable upload keys
to short-lived signed GET URLs so existing persisted /static/uploads URLs work.
"""
from __future__ import annotations

import os
from functools import lru_cache
import hashlib

from flask import current_app


@lru_cache(maxsize=4)
def _client(endpoint: str | None, region: str, access_key: str, secret_key: str):
    import boto3
    from botocore.config import Config
    return boto3.client(
        "s3",
        endpoint_url=endpoint or None,
        region_name=region,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )


def _settings() -> tuple[object, str]:
    bucket = current_app.config.get("OBJECT_STORAGE_BUCKET")
    if not bucket:
        raise RuntimeError("Private object storage is not configured.")
    client = _client(
        current_app.config.get("OBJECT_STORAGE_ENDPOINT"),
        current_app.config.get("OBJECT_STORAGE_REGION", "auto"),
        current_app.config.get("OBJECT_STORAGE_ACCESS_KEY", ""),
        current_app.config.get("OBJECT_STORAGE_SECRET_KEY", ""),
    )
    return client, bucket


def put_image(key: str, data: bytes) -> None:
    client, bucket = _settings()
    params = dict(
        Bucket=bucket,
        Key=key,
        Body=data,
        ContentType="image/jpeg",
        ContentDisposition="inline",
        CacheControl="private, max-age=300",
        Metadata={"validated": "image/jpeg", "sha256": hashlib.sha256(data).hexdigest()},
    )
    encryption = current_app.config.get("OBJECT_STORAGE_SSE")
    if encryption:
        params["ServerSideEncryption"] = encryption
    client.put_object(**params)


def signed_get_url(key: str) -> str:
    client, bucket = _settings()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key, "ResponseContentType": "image/jpeg", "ResponseContentDisposition": "inline"},
        ExpiresIn=current_app.config.get("OBJECT_STORAGE_URL_TTL", 300),
    )


def delete_object(key: str) -> None:
    client, bucket = _settings()
    client.delete_object(Bucket=bucket, Key=key)


def verify_object(key: str, expected_bytes: int, expected_sha256: str) -> bool:
    client, bucket = _settings()
    response = client.head_object(Bucket=bucket, Key=key)
    metadata = response.get("Metadata", {})
    return (
        int(response.get("ContentLength", -1)) == expected_bytes
        and metadata.get("sha256") == expected_sha256
    )


def configured() -> bool:
    return bool(current_app.config.get("OBJECT_STORAGE_BUCKET"))
