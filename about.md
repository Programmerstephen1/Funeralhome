# About this Funeral Home Web Project

## Project Summary
This project is a full-stack funeral home website for `last planner julz Hub`, built with:
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python Flask + SQLAlchemy
- **Payment Integration**: M-Pesa STK push via Safaricom Daraja
- **Email / OTP**: Flask-Mail for OTP and receipt emails
- **Hosting**: Designed to deploy on Render / similar cloud host, with production environment support

The site supports visitor browsing, booking checkout, payment initiation, OTP verification, user management, memorial pages, and consultation requests.

---

## User Flows

### 1. Visitor / Home Flow
- Visitor lands on the homepage.
- They can browse services, memorial pages, galleries, and planned offerings.
- They can request a consultation via the contact form.
- Consultation requests are stored in the backend and optionally emailed to the site operator.

### 2. Account & Authentication Flow
- Visitor can register with email + password.
- Registration stores a user record in the backend.
- Login returns a JWT token for protected routes.
- Token-based auth is required for user-only features such as tributes and eulogies.

### 3. Email OTP / Verification Flow
- Registered users can request an OTP email using `/api/auth/send-otp`.
- A 6-digit code is generated and stored with a 10-minute expiry.
- The email is sent with the OTP code for verification.
- Users verify with `/api/auth/verify-otp`.
- Password reset is handled through `/api/auth/reset-password` using the same OTP mechanism.

### 4. Funeral Booking Checkout Flow
- User selects funeral provisions from the booking pages.
- The checkout pages gather customer contact info, venue details, date, and phone number.
- Payment method selection currently supports M-Pesa.
- The checkout code uses the `VITE_API_URL` environment variable for production backend routing.
- When M-Pesa is selected, the frontend calls `/api/payments/stkpush`.

### 5. M-Pesa Payment Flow
- Backend receives checkout requests at `/api/payments/stkpush`.
- The backend calls M-Pesa Daraja OAuth to obtain an access token.
- It constructs the STK push payload and submits to Safaricom.
- Payment transaction metadata is persisted in `PaymentTransaction` for callback correlation.
- The callback URL is provided in `MPESA_CALLBACK_URL` and attached to the STK push request.
- Once M-Pesa sends callback data, the backend processes it at `/api/payments/callback`.
- If callback includes a matching transaction, it updates the transaction status and sends a receipt email.

### 6. Memorial & Eulogy Flow
- Authenticated users can create eulogies and memorial content.
- Eulogies are stored in the database and can be shared via a public URL.
- There is a dedicated eulogy viewer page for public display.

### 7. Debug & Deployment Flow
- New debug endpoints are available for environment health and payment transaction inspection:
  - `GET /api/debug/status`
  - `GET /api/debug/payment-transactions`
- Debug endpoints are allowed when `ALLOW_DEBUG_ENDPOINTS=true` or when Flask `DEBUG` is enabled.
- Backend environment is driven by `.env` values or Render environment variables.

---

## Current Implementation Details

### Frontend
- `frontend/src/services/api.js`: central API wrapper with token handling.
- `frontend/src/pages/*`: page-level UI and API calls.
- `VITE_API_URL` is used to route production frontend requests to the backend.
- `frontend/src/pages/ForgotPasswordPage.jsx`, `HomePage.jsx`, `WriteEulogyPage.jsx`, and `EulogyViewPage.jsx` now use the production-friendly API base.
- `BookingCheckoutPage.jsx`, `CheckoutPage.jsx`, and `PlanAheadPage.jsx` support M-Pesa checkout and mock payment testing.

### Backend
- `backend/app/__init__.py`: creates Flask app, registers CORS, configures SQLAlchemy and Flask-Mail.
- `backend/app/models.py`: defines user, tribute, consultation, eulogy, and payment transaction models.
- `backend/app/routes.py`: exposes auth, booking, payment, callback, consultation, and debug APIs.
- `backend/app/mpesa.py`: handles OAuth token retrieval and STK push request generation.

### Deployment / Hosting
- `DEPLOYMENT.md` explains how to configure `VITE_API_URL` and environment variables.
- `ENVIRONMENT.md` documents local dev setup and production environment expectations.

---

## Required Environment Variables

### Backend
- `SECRET_KEY`
- `DATABASE_URL`
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL`
- `MAIL_SERVER`
- `MAIL_PORT`
- `MAIL_USE_TLS`
- `MAIL_USE_SSL`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_SUPPRESS_SEND` (optional)

### Frontend
- `VITE_API_URL` (production backend URL)
- `VITE_PAYMENT_PROVIDER` (optional mock fallback)

---

## Financial Estimate & Hosting Costs

### Development Cost Estimate
These are example estimates for the remaining work and delivery.
- **Initial build & setup**: 20–30 hours
- **Polish UI / responsiveness**: 8–12 hours
- **Payment integration testing and stabilization**: 10–15 hours
- **Email/OTP and production hardening**: 8–12 hours
- **Deployment & QA**: 6–10 hours

**Estimated total development cost**: `USD 1,000 - 2,500` depending on hourly rate and scope.

### Hosting Cost Estimate (Example: Truehost)
For Truehost-style shared hosting, expect:
- **Domain name**: ~KES 1,200–2,000 per year
- **Shared hosting**: ~KES 3,000–6,000 per month
- **Managed database or VPS**: ~KES 5,000–15,000 per month if you need PostgreSQL / dedicated resources
- **SSL certificate**: free via Let’s Encrypt or bundled via host
- **Email sending / SMTP service**: ~KES 1,000–4,000 per month if you use a transactional email provider

### Example ongoing monthly budget
- Hosting plan: `KES 3,000 - 6,000`
- Database / production instance: `KES 5,000 - 15,000`
- Email service: `KES 1,000 - 4,000`
- Maintenance/support: `KES 3,000 - 8,000`

**Total ongoing monthly budget**: `KES 12,000 - 33,000` (approx.)

### One-time deployment costs
- Domain registration: `KES 1,200 - 2,000`
- Initial deployment and configuration: part of the development cost above
- Payment provider onboarding fees: depends on M-Pesa registration requirements

---

## Recommended Hosting Finance Checklist
- Purchase or renew the domain
- Choose a hosting plan that supports Flask and SSL
- Confirm the backend public URL and update `VITE_API_URL`
- Configure the SMTP/transactional email provider
- Ensure a production database is available
- Enable daily backups and monitoring if possible

---

## Unfinished Todos and Professional Fixes Needed

### High-priority fixes before launch
- [ ] **Confirm and correct production Render env vars**
  - `MPESA_CALLBACK_URL` must be exact with no trailing newline
  - `MAIL_USE_TLS` / `MAIL_USE_SSL` must match the SMTP provider
  - `VITE_API_URL` must point to the live backend origin
- [ ] **Complete live M-Pesa STK push testing**
  - verify `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_SHORTCODE`, and `MPESA_PASSKEY` in production
  - verify callback handling from Safaricom
  - confirm `checkout_request_id` persistence and callback status updates
- [ ] **Verify OTP email delivery in production**
  - confirm SMTP credentials work
  - confirm `MAIL_SUPPRESS_SEND` is disabled
  - ensure OTP emails and payment receipts are actually sent
- [ ] **Replace any remaining local fallback host references**
  - ensure all frontend code uses `VITE_API_URL || window.location.origin`
- [ ] **Enable stricter CORS for production**
  - lock allowed origins to the actual frontend host once production deployment is stable

### Functional improvements still needed
- [ ] Add full user registration / login flow and session persistence for protected pages
- [ ] Build a real admin dashboard for memorial management and booking oversight
- [ ] Add image upload support for tributes, memorials, and gallery content
- [ ] Add real-time feedback for payment completion rather than redirecting blindly
- [ ] Add stronger webhook verification for the M-Pesa callback endpoint
- [ ] Add server-side validation and sanitization for all booking and payment fields
- [ ] Add error logging and alerting for failed email delivery and failed M-Pesa callbacks
- [ ] Add retry logic or fallback for OTP delivery if email fails
- [ ] Add confirmation pages and receipts for booking details and payment status

### Quality-of-life polish
- [ ] Improve accessibility and keyboard navigation
- [ ] Add unit tests and integration tests for key backend flows
- [ ] Add E2E tests for checkout and OTP flows
- [ ] Improve the mobile/tablet layout of booking and memorial pages
- [ ] Add page-level loading states for all API calls
- [ ] Add user-friendly error modals instead of browser `alert()` for failures

---

## Current Known Issues and Fixes Applied

### Fixes already completed
- Removed tracked bytecode from the repo
- Added backend debug endpoints for payment status and environment checks
- Added `PaymentTransaction` persistence for callback correlation
- Added backend warnings for missing mail and MPesa config
- Added production-safe API URL handling in frontend pages
- Added callback URL sanitization and inferred SMTP security mode in backend

### Current warning items
- `GET /api/debug/status` currently reports M-Pesa as **not configured** on the deployed backend
- `MPESA_CALLBACK_URL` has a stray newline in current environment output
- Email configuration is set, but `MAIL_USE_TLS` is currently false in the deployed status response; this must match provider settings

---

## Notes for the Client Meeting

### What is ready now
- The website is structurally built and runnable in development.
- The user flows are implemented for consultation requests, account registration, OTP verification, and memorial creation.
- Payment flow is implemented to initiate M-Pesa STK push and store transaction metadata.
- Debug endpoints are in place to inspect status and payments.

### What still needs formal delivery work
- Production verification of M-Pesa and email
- Final deployment configuration and environment cleanup
- UI polish, accessibility, and more robust failure handling
- Higher-quality admin/content management experience

### Suggested next steps for the client
1. Confirm production backend URL and set `VITE_API_URL` in the frontend host.
2. Confirm SMTP credentials and disable `MAIL_SUPPRESS_SEND`.
3. Confirm M-Pesa Daraja credentials and callback URL in Render.
4. Run one live STK payment and verify callback + email receipt.
5. Continue with the upgrade list above to make the site truly production-grade.

---

## Recommended Budget Summary
- **Minimum launch preparation**: `USD 1,000 - 2,500`
- **Truehost-style monthly hosting**: `KES 12,000 - 33,000`
- **Domain registration**: `KES 1,200 - 2,000 / year`
- **Email service**: `KES 1,000 - 4,000 / month`
- **Ongoing support and maintenance**: `KES 3,000 - 8,000 / month`

This document should help you present the current state, the remaining work, and the budget required to take the site from its current codebase to professional production readiness.
