# Admin Forgot Password Design

## Goal

Add a forgot-password flow for the web admin login screen so staff and system admins can recover access by proving control of their admin email address.

## Current Context

- The web admin app uses `web-app/src/pages/LoginPage.jsx` as the only public auth screen.
- Admin auth routes live under `/api/admin` and use `backend/controllers/adminController.js`.
- Admin accounts are stored in the `Admin` model, which already has `otp` and `otpExpiry` fields used for staff email verification. A shared `otpPurpose` field distinguishes staff verification OTPs from password-reset OTPs.
- Customer/mobile password reset already uses a 6-digit email OTP and short-lived reset token on `/api/auth`.
- The authenticated admin profile UI already documents a strong password policy: 8-32 characters, uppercase, lowercase, number, and one special character from `!@#$%^&*`.

## Decisions

- Use a 6-digit email OTP rather than an emailed reset link.
- Keep the flow inline inside the existing `LoginPage` card instead of adding public routes.
- Return a non-enumerating success response from the reset-code request endpoint.
- Do not allow disabled admin accounts to complete password reset.
- Allow unverified staff accounts to reset their password; successful reset also marks the account verified.
- Reuse `Admin.otp` and `Admin.otpExpiry` for reset OTPs, with `Admin.otpPurpose` set to `password_reset` so reset codes cannot be used on the staff verification endpoint.
- Staff email verification OTPs use `otpPurpose: staff_verification` so they cannot be exchanged for password-reset tokens.
- During rollout, staff verification may also accept legacy null-purpose OTPs only for unverified, enabled admins; password-reset verification must never accept null-purpose OTPs.
- Enforce the shared strong password policy server-side.
- Write audit events for reset request, OTP verification, and reset completion when an admin account exists.
- Do not add integration tests for this feature.

## Backend Design

Add these unauthenticated admin routes in `backend/routes/adminRoutes.js`:

- `POST /api/admin/request-password-reset-otp`
- `POST /api/admin/verify-password-reset-otp`
- `POST /api/admin/reset-password`

Implement handlers in `backend/controllers/adminController.js`.

`requestPasswordResetOtp`:

- Accepts `{ email }`.
- Looks up an active `Admin` by email.
- Always returns HTTP 200 with a generic message such as: `If an admin account exists for that email, a reset code has been sent.`
- If no admin exists or the account is disabled, do not send an email and do not expose that fact.
- If an active admin exists, generate a cryptographically secure 6-digit OTP, store it in `otp` with a 5-minute `otpExpiry` and `otpPurpose: password_reset`, send it by email, and log a safe audit event.
- If email sending fails for an active admin after OTP storage, clear `otp`, `otpExpiry`, and `otpPurpose` only when the current reset state still matches the written OTP, expiry, and purpose; log the internal error server-side, and still return the same generic HTTP 200 response. Do not expose delivery failure to the client.

`verifyPasswordResetOtp`:

- Accepts `{ email, otp }`.
- Finds the admin by email and rejects missing, disabled, missing OTP, non-`password_reset` purpose, mismatched OTP, or expired OTP with a generic invalid/expired OTP response.
- On success, returns a reset token signed with `RESET_PASSWORD_SECRET` and valid for 10 minutes.
- The reset token includes the current reset-state nonce (`otpExpiry`) and can only be used while the matching `password_reset` OTP state still exists.
- Logs a safe audit event.

`resetPassword`:

- Accepts `{ token, newPassword }`.
- Verifies the reset token with `RESET_PASSWORD_SECRET`.
- Finds the admin by token subject and rejects missing or disabled accounts.
- Validates the new password against the shared policy.
- Hashes the new password, atomically updates only when the stored OTP state is still present with `otpPurpose: password_reset` and matching `otpExpiry`, clears `otp`, `otpExpiry`, and `otpPurpose`, and sets `isVerified: true`.
- Logs a safe audit event.

Add a small shared validation helper inside `adminController.js` unless a local utility already exists by implementation time. Use it for both forgot-password reset and the existing authenticated `changePassword` handler so backend behavior matches the profile UI.

## Frontend Design

Extend `web-app/src/pages/LoginPage.jsx` with additional inline steps:

- `login`: existing username/password login screen.
- `verify`: existing staff email verification OTP screen.
- `forgot`: admin enters email to request a reset OTP.
- `resetOtp`: admin enters the emailed reset OTP.
- `newPassword`: admin enters and confirms a new password.

Add a `Forgot password?` secondary action below the password field. Preserve the existing two-panel login layout, brand block, form card, and message styling.

Behavior:

- On `forgot`, submit to `/api/admin/request-password-reset-otp`.
- On success, move to `resetOtp` and show the generic email-sent message.
- On `resetOtp`, submit email and OTP to `/api/admin/verify-password-reset-otp`.
- Store the returned reset token in component state only.
- On `newPassword`, validate password and confirmation locally, submit to `/api/admin/reset-password`, then return to `login` with a success message.
- Provide back actions from reset steps to the login screen.
- Disable submit buttons while requests are in flight.

CSS additions should stay within `web-app/src/styles/LoginPage.css` and reuse the existing button, input, message, and card language. Add only small classes for secondary text buttons, password hints, and disabled button states.

## Security And Error Handling

- Do not reveal whether a reset-request email exists.
- Do not reveal email delivery failures from the reset-request endpoint.
- Do not expose disabled account status in public reset endpoints.
- Do not log OTPs, reset tokens, or password values.
- Separate staff verification OTPs from password-reset OTPs with `otpPurpose` checks.
- Clear OTP fields and `otpPurpose` after successful staff verification, after successful reset, and after failed reset email delivery.
- Keep reset tokens short-lived at 10 minutes.
- Keep OTPs valid for 5 minutes to match existing OTP behavior.
- Use JSON error responses for all known failure paths.

## Test Plan

No integration tests.

Add focused controller unit tests using the existing `node:test` and `require.cache` mocking style used by `backend/controllers/authController.test.js`.

Cover:

- Reset-code request returns generic HTTP 200 for missing email.
- Reset-code request does not send email for disabled admins.
- Reset-code request returns the same generic HTTP 200 and clears reset OTP state if email sending fails for an active admin.
- OTP verification rejects missing, disabled, mismatched, and expired cases generically.
- OTP verification rejects OTPs created for the other admin OTP purpose.
- OTP verification returns a reset token for a valid active admin.
- Password reset rejects invalid or expired reset tokens.
- Password reset rejects passwords that violate the shared policy.
- Password reset hashes the password, requires matching `password_reset` OTP state, clears OTP fields and `otpPurpose`, and marks unverified admins verified.
- Staff verification requires `staff_verification` OTP state, except for the transitional legacy null-purpose staff OTP case, and clears `otpPurpose` on success.
- Existing authenticated change-password enforces the same shared password policy.

Verification commands:

- `cd backend; node --test controllers/adminController.test.js`
- `cd web-app; npm run lint`
- `cd web-app; npm run build`

## Out Of Scope

- No reset-link email flow.
- No new public frontend routes.
- No database migrations.
- No rate limiting or CAPTCHA changes.
- No customer/mobile password reset changes.
- No integration tests.
