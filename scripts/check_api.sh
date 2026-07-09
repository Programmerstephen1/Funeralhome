#!/usr/bin/env bash
set -euo pipefail

API_BASE=${1:-}
if [ -z "$API_BASE" ]; then
  echo "Usage: $0 https://your-backend.example.com"
  exit 1
fi

echo "Checking health at $API_BASE/api/health"
curl -fsS "$API_BASE/api/health" || { echo "Health check failed"; exit 2; }
echo

echo "Sending sample consultation POST to $API_BASE/api/consultations"
curl -sS "$API_BASE/api/consultations" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Automated Check","email":"no-reply@example.com","phone":"0000000000","questions":"Test from check script"}' \
  -w "\nHTTP STATUS: %{http_code}\n"

echo
echo "Done"
