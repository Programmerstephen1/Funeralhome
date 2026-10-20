"""Deprecated compatibility entry point; schema changes are Alembic migrations."""
import subprocess
import sys
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
command = [sys.executable, "-m", "flask", "--app", "run:app", "db", "upgrade"]
raise SystemExit(subprocess.call(command, cwd=backend))
