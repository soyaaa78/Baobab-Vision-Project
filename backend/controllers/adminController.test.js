const test = require("node:test");
const assert = require("node:assert/strict");

const adminControllerPath = require.resolve("./adminController");
const adminModelPath = require.resolve("../models/Admin");
const userModelPath = require.resolve("../models/User");
const sendEmailPath = require.resolve("../services/sendEmail");
const auditLogPath = require.resolve("../services/auditLogService");
const bcryptPath = require.resolve("bcryptjs");
const jwtPath = require.resolve("jsonwebtoken");

const GENERIC_RESET_REQUEST_MESSAGE =
  "If an admin account exists for that email, a reset code has been sent.";
const RESET_EMAIL_FAILURE_MESSAGE =
  "Unable to send password reset code. Please try again later.";
const INVALID_OTP_MESSAGE = "Invalid or expired OTP";
const INVALID_RESET_TOKEN_MESSAGE = "Invalid or expired reset token";
const PASSWORD_POLICY_MESSAGE =
  "Password must be 8-32 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)";

const originalResetSecret = process.env.RESET_PASSWORD_SECRET;

const clearControllerCache = () => {
  delete require.cache[adminControllerPath];
  delete require.cache[adminModelPath];
  delete require.cache[userModelPath];
  delete require.cache[sendEmailPath];
  delete require.cache[auditLogPath];
  delete require.cache[bcryptPath];
  delete require.cache[jwtPath];
};

const loadAdminController = ({
  admin = {},
  user = {},
  sendEmail = async () => {},
  logEvent = () => {},
  bcrypt = {
    compare: async () => true,
    hash: async (password) => `hashed:${password}`,
  },
  jwt = {
    sign: () => "reset-token",
    verify: () => ({ id: "admin-1" }),
  },
} = {}) => {
  clearControllerCache();

  require.cache[adminModelPath] = {
    id: adminModelPath,
    filename: adminModelPath,
    loaded: true,
    exports: admin,
  };
  require.cache[userModelPath] = {
    id: userModelPath,
    filename: userModelPath,
    loaded: true,
    exports: user,
  };
  require.cache[sendEmailPath] = {
    id: sendEmailPath,
    filename: sendEmailPath,
    loaded: true,
    exports: sendEmail,
  };
  require.cache[auditLogPath] = {
    id: auditLogPath,
    filename: auditLogPath,
    loaded: true,
    exports: { logEvent },
  };
  require.cache[bcryptPath] = {
    id: bcryptPath,
    filename: bcryptPath,
    loaded: true,
    exports: bcrypt,
  };
  require.cache[jwtPath] = {
    id: jwtPath,
    filename: jwtPath,
    loaded: true,
    exports: jwt,
  };

  return require("./adminController");
};

const createResponse = () => {
  const res = {
    statusCode: undefined,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

const silenceConsoleError = async (callback) => {
  const originalConsoleError = console.error;
  console.error = () => {};
  try {
    await callback();
  } finally {
    console.error = originalConsoleError;
  }
};

test.afterEach(() => {
  clearControllerCache();
  if (originalResetSecret === undefined) {
    delete process.env.RESET_PASSWORD_SECRET;
  } else {
    process.env.RESET_PASSWORD_SECRET = originalResetSecret;
  }
});

test("requestPasswordResetOtp returns generic HTTP 200 when email is not an admin account", async () => {
  const sendEmailCalls = [];
  const logCalls = [];
  const admin = {
    findOne: async () => null,
    updateOne: async () => assert.fail("missing admin should not be updated"),
  };
  const { requestPasswordResetOtp } = loadAdminController({
    admin,
    sendEmail: async (...args) => sendEmailCalls.push(args),
    logEvent: (...args) => logCalls.push(args),
  });
  const res = createResponse();

  await requestPasswordResetOtp(
    { body: { email: "missing@example.com" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: GENERIC_RESET_REQUEST_MESSAGE });
  assert.equal(sendEmailCalls.length, 0);
  assert.equal(logCalls.length, 0);
});

test("requestPasswordResetOtp does not send email for disabled admins", async () => {
  const sendEmailCalls = [];
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "disabled@example.com",
      isDisabled: true,
    }),
    updateOne: async () => assert.fail("disabled admin should not be updated"),
  };
  const { requestPasswordResetOtp } = loadAdminController({
    admin,
    sendEmail: async (...args) => sendEmailCalls.push(args),
  });
  const res = createResponse();

  await requestPasswordResetOtp(
    { body: { email: "disabled@example.com" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: GENERIC_RESET_REQUEST_MESSAGE });
  assert.equal(sendEmailCalls.length, 0);
});

test("requestPasswordResetOtp returns JSON HTTP 500 when email sending fails for an active admin", async () => {
  let updateCall;
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      firstname: "Active",
      isDisabled: false,
    }),
    updateOne: async (query, update) => {
      updateCall = { query, update };
      return { modifiedCount: 1 };
    },
  };
  const { requestPasswordResetOtp } = loadAdminController({
    admin,
    sendEmail: async () => {
      throw new Error("email service unavailable");
    },
  });
  const res = createResponse();

  await silenceConsoleError(async () => {
    await requestPasswordResetOtp(
      { body: { email: "active@example.com" } },
      res
    );
  });

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { message: RESET_EMAIL_FAILURE_MESSAGE });
  assert.deepEqual(updateCall.query, { _id: "admin-1" });
  assert.match(updateCall.update.$set.otp, /^\d{6}$/);
  assert.ok(Number(updateCall.update.$set.otpExpiry) > Date.now());
});

test("requestPasswordResetOtp stores an OTP, sends email, and logs safely for an active admin", async () => {
  let updateCall;
  const sendEmailCalls = [];
  const logCalls = [];
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      firstname: "Active",
      isDisabled: false,
    }),
    updateOne: async (query, update) => {
      updateCall = { query, update };
      return { modifiedCount: 1 };
    },
  };
  const { requestPasswordResetOtp } = loadAdminController({
    admin,
    sendEmail: async (...args) => sendEmailCalls.push(args),
    logEvent: (...args) => logCalls.push(args),
  });
  const res = createResponse();

  await requestPasswordResetOtp(
    { body: { email: "active@example.com" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: GENERIC_RESET_REQUEST_MESSAGE });
  assert.deepEqual(updateCall.query, { _id: "admin-1" });
  assert.match(updateCall.update.$set.otp, /^\d{6}$/);
  assert.ok(Number(updateCall.update.$set.otpExpiry) > Date.now());
  assert.equal(sendEmailCalls.length, 1);
  assert.equal(logCalls.length, 1);
  const logEvents = logCalls.map((args) => args[1]);
  assert.equal(
    JSON.stringify(logEvents).includes(updateCall.update.$set.otp),
    false
  );
});

test("verifyPasswordResetOtp rejects a missing admin with a generic invalid OTP response", async () => {
  const admin = { findOne: async () => null };
  const { verifyPasswordResetOtp } = loadAdminController({ admin });
  const res = createResponse();

  await verifyPasswordResetOtp(
    { body: { email: "missing@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_OTP_MESSAGE });
});

test("verifyPasswordResetOtp rejects a disabled admin with a generic invalid OTP response", async () => {
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "disabled@example.com",
      isDisabled: true,
      otp: "123456",
      otpExpiry: Date.now() + 60 * 1000,
    }),
  };
  const { verifyPasswordResetOtp } = loadAdminController({ admin });
  const res = createResponse();

  await verifyPasswordResetOtp(
    { body: { email: "disabled@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_OTP_MESSAGE });
});

test("verifyPasswordResetOtp rejects a missing stored OTP with a generic invalid OTP response", async () => {
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      isDisabled: false,
      otp: null,
      otpExpiry: Date.now() + 60 * 1000,
    }),
  };
  const { verifyPasswordResetOtp } = loadAdminController({ admin });
  const res = createResponse();

  await verifyPasswordResetOtp(
    { body: { email: "active@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_OTP_MESSAGE });
});

test("verifyPasswordResetOtp rejects a mismatched OTP with a generic invalid OTP response", async () => {
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      isDisabled: false,
      otp: "123456",
      otpExpiry: Date.now() + 60 * 1000,
    }),
  };
  const { verifyPasswordResetOtp } = loadAdminController({ admin });
  const res = createResponse();

  await verifyPasswordResetOtp(
    { body: { email: "active@example.com", otp: "654321" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_OTP_MESSAGE });
});

test("verifyPasswordResetOtp rejects an expired OTP with a generic invalid OTP response", async () => {
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      isDisabled: false,
      otp: "123456",
      otpExpiry: Date.now() - 1000,
    }),
  };
  const { verifyPasswordResetOtp } = loadAdminController({ admin });
  const res = createResponse();

  await verifyPasswordResetOtp(
    { body: { email: "active@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_OTP_MESSAGE });
});

test("verifyPasswordResetOtp returns a reset token for a valid active admin", async () => {
  process.env.RESET_PASSWORD_SECRET = "reset-secret";
  let signCall;
  const logCalls = [];
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      isDisabled: false,
      otp: "123456",
      otpExpiry: Date.now() + 60 * 1000,
    }),
  };
  const { verifyPasswordResetOtp } = loadAdminController({
    admin,
    jwt: {
      sign: (payload, secret, options) => {
        signCall = { payload, secret, options };
        return "reset-token";
      },
      verify: () => assert.fail("verify should not run while verifying OTP"),
    },
    logEvent: (...args) => logCalls.push(args),
  });
  const res = createResponse();

  await verifyPasswordResetOtp(
    { body: { email: "active@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    message: "OTP verified",
    resetToken: "reset-token",
  });
  assert.deepEqual(signCall, {
    payload: { id: "admin-1" },
    secret: "reset-secret",
    options: { expiresIn: "10m" },
  });
  assert.equal(logCalls.length, 1);
  const logText = JSON.stringify(logCalls.map((args) => args[1]));
  assert.equal(logText.includes("123456"), false);
  assert.equal(logText.includes("reset-token"), false);
});

test("resetPassword rejects invalid or expired reset tokens", async () => {
  process.env.RESET_PASSWORD_SECRET = "reset-secret";
  const admin = {
    findById: async () => assert.fail("invalid token should not load admin"),
  };
  const { resetPassword } = loadAdminController({
    admin,
    jwt: {
      sign: () => assert.fail("sign should not run while resetting password"),
      verify: () => {
        throw new Error("jwt expired");
      },
    },
  });
  const res = createResponse();

  await silenceConsoleError(async () => {
    await resetPassword(
      { body: { token: "expired-token", newPassword: "ValidPass1!" } },
      res
    );
  });

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_RESET_TOKEN_MESSAGE });
});

test("resetPassword rejects disabled admins without hashing the password", async () => {
  process.env.RESET_PASSWORD_SECRET = "reset-secret";
  const admin = {
    findById: async () => ({ _id: "admin-1", isDisabled: true }),
    updateOne: async () => assert.fail("disabled admin should not be updated"),
  };
  const { resetPassword } = loadAdminController({
    admin,
    bcrypt: {
      compare: async () => true,
      hash: async () => assert.fail("disabled admin password should not hash"),
    },
  });
  const res = createResponse();

  await resetPassword(
    { body: { token: "valid-token", newPassword: "ValidPass1!" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_RESET_TOKEN_MESSAGE });
});

test("resetPassword rejects passwords that violate the shared password policy", async () => {
  process.env.RESET_PASSWORD_SECRET = "reset-secret";
  const admin = {
    findById: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      isDisabled: false,
    }),
    updateOne: async () => assert.fail("invalid password should not update"),
  };
  const { resetPassword } = loadAdminController({
    admin,
    bcrypt: {
      compare: async () => true,
      hash: async () => assert.fail("invalid password should not hash"),
    },
  });
  const res = createResponse();

  await resetPassword(
    { body: { token: "valid-token", newPassword: "lowercase1!" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: PASSWORD_POLICY_MESSAGE });
});

test("resetPassword hashes the password, clears OTP fields, and marks unverified admins verified", async () => {
  process.env.RESET_PASSWORD_SECRET = "reset-secret";
  let verifyCall;
  let hashCall;
  let updateCall;
  const logCalls = [];
  const admin = {
    findById: async (id) => {
      assert.equal(id, "admin-1");
      return {
        _id: "admin-1",
        email: "active@example.com",
        isDisabled: false,
        isVerified: false,
      };
    },
    updateOne: async (query, update) => {
      updateCall = { query, update };
      return { modifiedCount: 1 };
    },
  };
  const { resetPassword } = loadAdminController({
    admin,
    bcrypt: {
      compare: async () => true,
      hash: async (password, rounds) => {
        hashCall = { password, rounds };
        return "hashed-new-password";
      },
    },
    jwt: {
      sign: () => assert.fail("sign should not run while resetting password"),
      verify: (token, secret) => {
        verifyCall = { token, secret };
        return { id: "admin-1" };
      },
    },
    logEvent: (...args) => logCalls.push(args),
  });
  const res = createResponse();

  await resetPassword(
    { body: { token: "valid-token", newPassword: "ValidPass1!" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: "Password reset successful" });
  assert.deepEqual(verifyCall, {
    token: "valid-token",
    secret: "reset-secret",
  });
  assert.deepEqual(hashCall, { password: "ValidPass1!", rounds: 10 });
  assert.deepEqual(updateCall, {
    query: { _id: "admin-1" },
    update: {
      $set: {
        password: "hashed-new-password",
        otp: null,
        otpExpiry: null,
        isVerified: true,
      },
    },
  });
  assert.equal(logCalls.length, 1);
  const logText = JSON.stringify(logCalls.map((args) => args[1]));
  assert.equal(logText.includes("ValidPass1!"), false);
  assert.equal(logText.includes("hashed-new-password"), false);
});

test("changePassword enforces the shared password policy", async () => {
  const admin = {
    findById: async () => ({
      _id: "admin-1",
      password: "stored-password",
      isDisabled: false,
    }),
    findByIdAndUpdate: async () =>
      assert.fail("invalid password should not update"),
  };
  const { changePassword } = loadAdminController({
    admin,
    bcrypt: {
      compare: async () => true,
      hash: async () => assert.fail("invalid password should not hash"),
    },
  });
  const res = createResponse();

  await changePassword(
    {
      user: { id: "admin-1" },
      body: {
        currentPassword: "CurrentPass1!",
        newPassword: "lowercase1!",
      },
    },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: PASSWORD_POLICY_MESSAGE });
});
