# Julz Assistant

## Runtime layout

- `frontend/src/components/chat/ChatWidget.jsx` is mounted once in the persistent
  React application shell so its in-memory conversation survives client-side
  route changes. It does not write conversations to local storage.
- `POST /api/chat` is a public Flask endpoint limited to 10 requests per minute
  per client IP through the shared Flask-Limiter storage. It accepts one message
  and at most eight user/assistant history entries.
- `GET /api/chat/status` reports only whether the provider settings are present.
- `backend/app/services/chat_service.py` supplies a fixed website-only system
  prompt, curated service/package facts, and a bounded public catalog snapshot.
  It never queries users, bookings, orders, payment records, or private memorial
  data. The request is stateless and is not written to the database or logs.
- The provider connection is server-to-server. The browser never receives the
  LLM API key, and the API response is rendered as escaped text with allowlisted
  internal links.

## Local provider configuration

Add these settings to `backend/.env` (not the frontend environment files):

```dotenv
LLM_API_URL=https://<provider-host>/v1/chat/completions
LLM_API_KEY=<server-only-provider-key>
LLM_MODEL=<provider-model-id>
```

The configured URL must use HTTPS, except a localhost HTTP endpoint for local
development. The provider must implement the OpenAI-compatible Chat Completions
request and response shape. Restart Flask after changing these settings. If any
setting is absent, the widget reports that chat is unavailable and continues to
offer direct links to packages and consultation planning.

## Privacy and operational notes

- The widget tells visitors not to enter credentials, OTPs, payment details, or
  private memorial information. Email addresses, phone-like strings, likely
  payment numbers, and credential assignments are redacted before provider
  submission.
- Conversation turns remain in component memory while browsing. Reloading the
  page clears the chat. The provider receives the sanitized user prompt and
  bounded conversation context; provider retention is governed by that
  provider's contract and settings.
- Provider errors, timeouts, rate limits, and offline states have user-safe
  messages. Prompt contents and provider credentials are not logged.
- Keep this feature disabled by leaving `LLM_API_URL`, `LLM_API_KEY`, or
  `LLM_MODEL` empty until the selected provider, privacy terms, retention policy,
  and budget limits are approved and configured.
