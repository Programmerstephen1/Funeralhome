"""Copy legacy local uploads into private object storage.

Run after configuring object storage and a verified database backup:
  python -m backend.scripts.migrate_uploads_to_object_storage --dry-run
  python -m backend.scripts.migrate_uploads_to_object_storage --apply
The script is resumable; it does not delete source files.
"""
import argparse
import hashlib
from pathlib import Path

from app import create_app, db
from app.models import UploadedFile
from app.storage import configured, put_image, verify_object


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--source-dir", type=Path, help="Legacy upload directory on the machine/runtime being migrated.")
    args = parser.parse_args()
    app = create_app()
    with app.app_context():
        if not configured():
            raise SystemExit("OBJECT_STORAGE_BUCKET and credentials are required.")
        upload_dir = args.source_dir or (Path(app.root_path) / "static" / "uploads")
        if not upload_dir.is_dir():
            raise SystemExit(f"Legacy upload directory does not exist: {upload_dir}")
        rows = UploadedFile.query.order_by(UploadedFile.id).all()
        missing = []
        for row in rows:
            path = upload_dir / Path(row.filename).name
            if not path.is_file():
                print(f"MISSING {row.filename}")
                missing.append(row.filename)
                continue
            payload = path.read_bytes()
            print(f"{'COPY' if args.apply else 'WOULD COPY'} {row.filename} sha256={hashlib.sha256(payload).hexdigest()}")
            if args.apply:
                put_image(row.filename, payload)
                if not verify_object(row.filename, len(payload), hashlib.sha256(payload).hexdigest()):
                    raise SystemExit(f"Verification failed for {row.filename}; source was retained.")
        if not args.apply:
            print(f"Dry run complete: {len(rows)} database records inspected; no writes made.")
        elif missing:
            raise SystemExit(f"Migration incomplete: {len(missing)} source objects were missing. Resolve before cutover.")


if __name__ == "__main__":
    main()
