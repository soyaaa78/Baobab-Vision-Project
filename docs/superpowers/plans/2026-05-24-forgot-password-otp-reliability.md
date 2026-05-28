# Forgot Password OTP Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (in-place default), or superpowers:subagent-driven-development plus superpowers:using-git-worktrees (isolated workspace), or superpowers:executing-plans (inline execution of the written plan). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make mobile forgot-password failures accurately report the real problem and make backend password-reset OTP routes return JSON even when email sending fails.

**Architecture:** Keep the API contract simple: auth routes always return JSON and mobile screens read server messages when available. Use the existing `ApiClient` base URL normalization so password reset follows the same network path as login.

**Tech Stack:** Express 4, Node `node:test`, Flutter/Dart `http`, existing `ApiClient`.

---

### Task 1: Backend OTP Error Handling

**Files:**
- Create: `backend/controllers/authController.passwordReset.test.js`
- Modify: `backend/controllers/authController.js`
- Modify: `backend/package.json`

- [ ] **Step 1: Write failing tests**

Add tests that load `authController` with mocked `User` and `sendEmail`, call `requestOtp` and `resendOtp`, and assert that email-send failure returns JSON `500`.

- [ ] **Step 2: Verify tests fail**

Run: `cd backend; node --test controllers/authController.passwordReset.test.js`

Expected before implementation: both email-failure tests fail because the handlers reject instead of calling `res.status(500).json(...)`.

- [ ] **Step 3: Implement minimal backend fix**

Wrap `requestOtp` and `resendOtp` in `try/catch`, preserve existing `404` and success responses, log failure, and return JSON messages.

- [ ] **Step 4: Verify backend tests pass**

Run: `cd backend; node --test controllers/authController.passwordReset.test.js`

Expected after implementation: all tests pass.

### Task 2: Mobile Password Reset Error Surfacing

**Files:**
- Modify: `mobile-app/lib/screens/forgot_password_screen.dart`
- Modify: `mobile-app/lib/screens/email_reset_password_screen.dart`
- Modify: `mobile-app/lib/screens/reset_password_screen.dart`

- [ ] **Step 1: Route through shared API client**

Replace hardcoded Render password-reset URLs with `ApiClient.postJson('/api/auth/...')`.

- [ ] **Step 2: Decode server messages defensively**

Decode JSON only when the response body is JSON. Fall back to status-based messages for non-JSON errors.

- [ ] **Step 3: Report network failures separately**

Only socket/timeout/client exceptions should mention connection/network. Backend failures should say OTP/password reset failed and show the server message when available.

### Task 3: Verification

**Files:**
- Existing files only.

- [ ] **Step 1: Run backend targeted test**

Run: `cd backend; node --test controllers/authController.passwordReset.test.js`

- [ ] **Step 2: Run backend suite**

Run: `cd backend; npm test`

- [ ] **Step 3: Analyze Flutter code**

Run: `cd mobile-app; flutter analyze`

- [ ] **Step 4: Build Android debug APK**

Run: `cd mobile-app; flutter build apk --debug`

Expected: build succeeds. Existing SDK warnings may remain if unrelated.
