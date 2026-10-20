FROM node:24-alpine AS frontend-build

WORKDIR /workspace
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
ARG VITE_API_URL=
ARG VITE_SENTRY_DSN=
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SENTRY_DSN=${VITE_SENTRY_DSN}
RUN npm run build --prefix frontend

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1
WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend ./backend
COPY --from=frontend-build /workspace/frontend/dist ./frontend/dist

EXPOSE 10000
CMD ["sh", "-c", "exec gunicorn --chdir backend run:app --bind 0.0.0.0:${PORT:-10000} --workers 2 --timeout 120"]
