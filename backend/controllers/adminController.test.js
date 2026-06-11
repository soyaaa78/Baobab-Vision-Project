const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const coreCrypto = require("node:crypto");

const adminControllerPath = require.resolve("./adminController");
const adminModelPath = require.resolve("../models/Admin");
const userModelPath = require.resolve("../models/User");
const sendEmailPath = require.resolve("../services/sendEmail");
const auditLogPath = require.resolve("../services/auditLogService");
const bcryptPath = require.resolve("bcryptjs");
const jwtPath = require.resolve("jsonwebtoken");

const GENERIC_RESET_REQUEST_MESSAGE =
  "If an admin account exists for that email, a reset code has been sent.";
const INVALID_OTP_MESSAGE = "Invalid or expired OTP";
const INVALID_RESET_TOKEN_MESSAGE = "Invalid or expired reset token";
const PASSWORD_POLICY_MESSAGE =
  "Password must be 8-32 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)";
const STAFF_VERIFICATION_PURPOSE = "staff_verification";
const PASSWORD_RESET_PURPOSE = "password_reset";

const originalResetSecret = process.env.RESET_PASSWORD_SECRET;
const originalRandomInt = coreCrypto.randomInt;
const originalRandomUUID = coreCrypto.randomUUID;

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
  coreCrypto.randomInt = originalRandomInt;
  coreCrypto.randomUUID = originalRandomUUID;
  if (originalResetSecret === undefined) {
    delete process.env.RESET_PASSWORD_SECRET;
  } else {
    process.env.RESET_PASSWORD_SECRET = originalResetSecret;
  }
});

test("login unverified admin stores a staff verification OTP purpose using crypto randomInt", async () => {
  const randomIntCalls = [];
  let updateCall;
  coreCrypto.randomInt = (min, max) => {
    randomIntCalls.push([min, max]);
    return 234567;
  };
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "staff@example.com",
      username: "staff",
      password: "stored-password",
      role: "staff_product",
      isDisabled: false,
      isVerified: false,
    }),
    updateOne: async (query, update) => {
      updateCall = { query, update };
      return { modifiedCount: 1 };
    },
  };
  const { login } = loadAdminController({
    admin,
    bcrypt: { compare: async () => true, hash: async () => "unused" },
  });
  const res = createResponse();

  await login({ body: { username: "staff", password: "password" } }, res);

  assert.equal(res.statusCode, 403);
  assert.deepEqual(randomIntCalls, [[100000, 1000000]]);
  assert.deepEqual(updateCall.query, { _id: "admin-1" });
  assert.deepEqual(updateCall.update.$set, {
    otp: "234567",
    otpExpiry: updateCall.update.$set.otpExpiry,
    otpPurpose: STAFF_VERIFICATION_PURPOSE,
  });
  assert.ok(Number(updateCall.update.$set.otpExpiry) > Date.now());
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

test("requestPasswordResetOtp returns generic HTTP 200 and clears reset state when email sending fails for an active admin", async () => {
  const updateCalls = [];
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      firstname: "Active",
      isDisabled: false,
    }),
    updateOne: async (query, update) => {
      updateCalls.push({ query, update });
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

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: GENERIC_RESET_REQUEST_MESSAGE });
  assert.equal(updateCalls.length, 2);
  assert.deepEqual(updateCalls[0].query, { _id: "admin-1" });
  assert.match(updateCalls[0].update.$set.otp, /^\d{6}$/);
  assert.ok(Number(updateCalls[0].update.$set.otpExpiry) > Date.now());
  assert.equal(updateCalls[0].update.$set.otpPurpose, PASSWORD_RESET_PURPOSE);
  assert.equal(updateCalls[0].update.$set.resetPasswordNonce, null);
  assert.deepEqual(updateCalls[1], {
    query: {
      _id: "admin-1",
      otp: updateCalls[0].update.$set.otp,
      otpExpiry: updateCalls[0].update.$set.otpExpiry,
      otpPurpose: PASSWORD_RESET_PURPOSE,
      resetPasswordNonce: null,
    },
    update: {
      $set: {
        otp: null,
        otpExpiry: null,
        otpPurpose: null,
        resetPasswordNonce: null,
      },
    },
  });
});

test("requestPasswordResetOtp stores an OTP, sends email, and logs safely for an active admin", async () => {
  let updateCall;
  const randomIntCalls = [];
  const sendEmailCalls = [];
  const logCalls = [];
  coreCrypto.randomInt = (min, max) => {
    randomIntCalls.push([min, max]);
    return 654321;
  };
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
  assert.deepEqual(randomIntCalls, [[100000, 1000000]]);
  assert.deepEqual(updateCall.query, { _id: "admin-1" });
  assert.equal(updateCall.update.$set.otp, "654321");
  assert.ok(Number(updateCall.update.$set.otpExpiry) > Date.now());
  assert.equal(updateCall.update.$set.otpPurpose, PASSWORD_RESET_PURPOSE);
  assert.equal(updateCall.update.$set.resetPasswordNonce, null);
  assert.equal(sendEmailCalls.length, 1);
  assert.equal(logCalls.length, 1);
  const logEvents = logCalls.map((args) => args[1]);
  assert.equal(
    JSON.stringify(logEvents).includes(updateCall.update.$set.otp),
    false
  );
});

test("verifyStaffOtp rejects password reset OTPs", async () => {
  let didUpdate = false;
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      role: "staff_product",
      isDisabled: false,
      otp: "123456",
      otpExpiry: Date.now() + 60 * 1000,
      otpPurpose: PASSWORD_RESET_PURPOSE,
    }),
    updateOne: async () => {
      didUpdate = true;
      return { modifiedCount: 1 };
    },
  };
  const { verifyStaffOtp } = loadAdminController({ admin });
  const res = createResponse();

  await verifyStaffOtp(
    { body: { email: "active@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_OTP_MESSAGE });
  assert.equal(didUpdate, false);
});

test("verifyStaffOtp rejects disabled admins with staff verification OTPs without signing a JWT", async () => {
  let didUpdate = false;
  let didSign = false;
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "disabled@example.com",
      role: "staff_product",
      isDisabled: true,
      isVerified: false,
      otp: "123456",
      otpExpiry: Date.now() + 60 * 1000,
      otpPurpose: STAFF_VERIFICATION_PURPOSE,
    }),
    updateOne: async () => {
      didUpdate = true;
      return { modifiedCount: 1 };
    },
  };
  const { verifyStaffOtp } = loadAdminController({
    admin,
    jwt: {
      sign: () => {
        didSign = true;
        return "admin-token";
      },
      verify: () => assert.fail("verify should not run while verifying OTP"),
    },
  });
  const res = createResponse();

  await verifyStaffOtp(
    { body: { email: "disabled@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 403);
  assert.equal(didUpdate, false);
  assert.equal(didSign, false);
});

test("verifyStaffOtp rejects disabled admins with legacy null-purpose OTPs without signing a JWT", async () => {
  let didUpdate = false;
  let didSign = false;
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "disabled@example.com",
      role: "staff_product",
      isDisabled: true,
      isVerified: false,
      otp: "123456",
      otpExpiry: Date.now() + 60 * 1000,
      otpPurpose: null,
    }),
    updateOne: async () => {
      didUpdate = true;
      return { modifiedCount: 1 };
    },
  };
  const { verifyStaffOtp } = loadAdminController({
    admin,
    jwt: {
      sign: () => {
        didSign = true;
        return "admin-token";
      },
      verify: () => assert.fail("verify should not run while verifying OTP"),
    },
  });
  const res = createResponse();

  await verifyStaffOtp(
    { body: { email: "disabled@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 403);
  assert.equal(didUpdate, false);
  assert.equal(didSign, false);
});

test("verifyStaffOtp clears OTP purpose after successful staff verification", async () => {
  let updateCall;
  const otpExpiryMs = Date.now() + 60 * 1000;
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      role: "staff_product",
      isDisabled: false,
      isVerified: false,
      otp: "123456",
      otpExpiry: new Date(otpExpiryMs),
      otpPurpose: STAFF_VERIFICATION_PURPOSE,
    }),
    updateOne: async (query, update) => {
      updateCall = { query, update };
      return { modifiedCount: 1 };
    },
  };
  const { verifyStaffOtp } = loadAdminController({ admin });
  const res = createResponse();

  await verifyStaffOtp(
    { body: { email: "active@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.equal(updateCall.query._id, "admin-1");
  assert.deepEqual(updateCall.query.isDisabled, { $ne: true });
  assert.equal(updateCall.query.isVerified, false);
  assert.equal(updateCall.query.otp, "123456");
  assert.equal(Number(updateCall.query.otpExpiry.$eq), otpExpiryMs);
  assert.ok(updateCall.query.otpExpiry.$gt instanceof Date);
  assert.deepEqual(updateCall.query.$or, [
    { otpPurpose: STAFF_VERIFICATION_PURPOSE },
  ]);
  assert.deepEqual(updateCall.update, {
    $set: {
      isVerified: true,
      otp: null,
      otpExpiry: null,
      otpPurpose: null,
    },
  });
});

test("verifyStaffOtp accepts a legacy null-purpose OTP for an unverified enabled admin", async () => {
  let updateCall;
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "legacy@example.com",
      role: "staff_product",
      isDisabled: false,
      isVerified: false,
      otp: "123456",
      otpExpiry: Date.now() + 60 * 1000,
      otpPurpose: null,
    }),
    updateOne: async (query, update) => {
      updateCall = { query, update };
      return { modifiedCount: 1 };
    },
  };
  const { verifyStaffOtp } = loadAdminController({ admin });
  const res = createResponse();

  await verifyStaffOtp(
    { body: { email: "legacy@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(updateCall.update.$set, {
    isVerified: true,
    otp: null,
    otpExpiry: null,
    otpPurpose: null,
  });
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
      otpPurpose: PASSWORD_RESET_PURPOSE,
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
      otpPurpose: PASSWORD_RESET_PURPOSE,
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
      otpPurpose: PASSWORD_RESET_PURPOSE,
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
      otpPurpose: PASSWORD_RESET_PURPOSE,
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

test("verifyPasswordResetOtp rejects staff verification OTPs", async () => {
  let didSign = false;
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      isDisabled: false,
      otp: "123456",
      otpExpiry: Date.now() + 60 * 1000,
      otpPurpose: STAFF_VERIFICATION_PURPOSE,
    }),
  };
  const { verifyPasswordResetOtp } = loadAdminController({
    admin,
    jwt: {
      sign: () => {
        didSign = true;
        return "reset-token";
      },
      verify: () => assert.fail("verify should not run while verifying OTP"),
    },
  });
  const res = createResponse();

  await verifyPasswordResetOtp(
    { body: { email: "active@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_OTP_MESSAGE });
  assert.equal(didSign, false);
});

test("verifyPasswordResetOtp rejects legacy null-purpose OTPs", async () => {
  let didSign = false;
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "legacy@example.com",
      isDisabled: false,
      isVerified: false,
      otp: "123456",
      otpExpiry: Date.now() + 60 * 1000,
      otpPurpose: null,
    }),
  };
  const { verifyPasswordResetOtp } = loadAdminController({
    admin,
    jwt: {
      sign: () => {
        didSign = true;
        return "reset-token";
      },
      verify: () => assert.fail("verify should not run while verifying OTP"),
    },
  });
  const res = createResponse();

  await verifyPasswordResetOtp(
    { body: { email: "legacy@example.com", otp: "123456" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_OTP_MESSAGE });
  assert.equal(didSign, false);
});

test("verifyPasswordResetOtp returns a reset token for a valid active admin", async () => {
  process.env.RESET_PASSWORD_SECRET = "reset-secret";
  let signCall;
  let updateCall;
  const logCalls = [];
  const otpExpiry = new Date(Date.now() + 60 * 1000);
  coreCrypto.randomUUID = () => "reset-nonce-1";
  const admin = {
    findOne: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      isDisabled: false,
      otp: "123456",
      otpExpiry,
      otpPurpose: PASSWORD_RESET_PURPOSE,
    }),
    updateOne: async (query, update) => {
      updateCall = { query, update };
      return { modifiedCount: 1 };
    },
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
  assert.equal(updateCall.query._id, "admin-1");
  assert.deepEqual(updateCall.query.isDisabled, { $ne: true });
  assert.equal(updateCall.query.otp, "123456");
  assert.equal(updateCall.query.otpPurpose, PASSWORD_RESET_PURPOSE);
  assert.deepEqual(updateCall.query.otpExpiry, { $eq: otpExpiry });
  assert.deepEqual(updateCall.update, {
    $set: { resetPasswordNonce: "reset-nonce-1" },
  });
  assert.deepEqual(signCall, {
    payload: {
      id: "admin-1",
      otpExpiry: otpExpiry.getTime(),
      resetPasswordNonce: "reset-nonce-1",
    },
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

test("resetPassword rejects tokens without a reset-state nonce", async () => {
  process.env.RESET_PASSWORD_SECRET = "reset-secret";
  const otpExpiryMs = Date.now() + 60 * 1000;
  let didLoadAdmin = false;
  const admin = {
    findById: async () => {
      didLoadAdmin = true;
      return {
        _id: "admin-1",
        email: "active@example.com",
        isDisabled: false,
      };
    },
    updateOne: async () => ({ modifiedCount: 1 }),
  };
  const { resetPassword } = loadAdminController({
    admin,
    jwt: {
      sign: () => assert.fail("sign should not run while resetting password"),
      verify: () => ({ id: "admin-1", otpExpiry: otpExpiryMs }),
    },
  });
  const res = createResponse();

  await resetPassword(
    { body: { token: "token-without-nonce", newPassword: "ValidPass1!" } },
    res
  );

  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_RESET_TOKEN_MESSAGE });
  assert.equal(didLoadAdmin, false);
});

test("resetPassword rejects disabled admins without hashing the password", async () => {
  process.env.RESET_PASSWORD_SECRET = "reset-secret";
  const otpExpiryMs = Date.now() + 60 * 1000;
  const admin = {
    findById: async () => ({ _id: "admin-1", isDisabled: true }),
    updateOne: async () => assert.fail("disabled admin should not be updated"),
  };
  const { resetPassword } = loadAdminController({
    admin,
    jwt: {
      sign: () => assert.fail("sign should not run while resetting password"),
      verify: () => ({
        id: "admin-1",
        otpExpiry: otpExpiryMs,
        resetPasswordNonce: "reset-nonce-1",
      }),
    },
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
  const otpExpiryMs = Date.now() + 60 * 1000;
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
    jwt: {
      sign: () => assert.fail("sign should not run while resetting password"),
      verify: () => ({
        id: "admin-1",
        otpExpiry: otpExpiryMs,
        resetPasswordNonce: "reset-nonce-1",
      }),
    },
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
  const otpExpiryMs = Date.now() + 60 * 1000;
  const admin = {
    findById: async (id) => {
      assert.equal(id, "admin-1");
      return {
        _id: "admin-1",
        email: "active@example.com",
        isDisabled: false,
      isVerified: false,
      otp: "123456",
      otpExpiry: new Date(otpExpiryMs),
      otpPurpose: PASSWORD_RESET_PURPOSE,
      resetPasswordNonce: "reset-nonce-1",
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
        return {
          id: "admin-1",
          otpExpiry: otpExpiryMs,
          resetPasswordNonce: "reset-nonce-1",
        };
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
  assert.equal(updateCall.query._id, "admin-1");
  assert.deepEqual(updateCall.query.isDisabled, { $ne: true });
  assert.deepEqual(updateCall.query.otp, { $exists: true, $ne: null });
  assert.equal(updateCall.query.otpPurpose, PASSWORD_RESET_PURPOSE);
  assert.deepEqual(updateCall.query.otpExpiry, { $eq: new Date(otpExpiryMs) });
  assert.equal(updateCall.query.resetPasswordNonce, "reset-nonce-1");
  assert.deepEqual(updateCall.update, {
    $set: {
      password: "hashed-new-password",
      otp: null,
      otpExpiry: null,
      otpPurpose: null,
      resetPasswordNonce: null,
      isVerified: true,
    },
  });
  assert.equal(logCalls.length, 1);
  const logText = JSON.stringify(logCalls.map((args) => args[1]));
  assert.equal(logText.includes("ValidPass1!"), false);
  assert.equal(logText.includes("hashed-new-password"), false);
});

test("resetPassword accepts matching reset state after original OTP expiry when JWT is valid", async () => {
  process.env.RESET_PASSWORD_SECRET = "reset-secret";
  const otpExpiryMs = Date.now() - 1000;
  let updateCall;
  const admin = {
    findById: async (id) => {
      assert.equal(id, "admin-1");
      return {
        _id: "admin-1",
        email: "active@example.com",
        isDisabled: false,
        otp: "123456",
        otpExpiry: new Date(otpExpiryMs),
        otpPurpose: PASSWORD_RESET_PURPOSE,
        resetPasswordNonce: "reset-nonce-1",
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
      hash: async () => "hashed-new-password",
    },
    jwt: {
      sign: () => assert.fail("sign should not run while resetting password"),
      verify: () => ({
        id: "admin-1",
        otpExpiry: otpExpiryMs,
        resetPasswordNonce: "reset-nonce-1",
      }),
    },
  });
  const res = createResponse();

  await resetPassword(
    { body: { token: "valid-token", newPassword: "ValidPass1!" } },
    res
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { message: "Password reset successful" });
  assert.equal(updateCall.query._id, "admin-1");
  assert.deepEqual(updateCall.query.isDisabled, { $ne: true });
  assert.deepEqual(updateCall.query.otp, { $exists: true, $ne: null });
  assert.equal(updateCall.query.otpPurpose, PASSWORD_RESET_PURPOSE);
  assert.deepEqual(updateCall.query.otpExpiry, { $eq: new Date(otpExpiryMs) });
  assert.equal(updateCall.query.resetPasswordNonce, "reset-nonce-1");
  assert.deepEqual(updateCall.update, {
    $set: {
      password: "hashed-new-password",
      otp: null,
      otpExpiry: null,
      otpPurpose: null,
      resetPasswordNonce: null,
      isVerified: true,
    },
  });
});

test("resetPassword rejects older reset tokens when the current reset nonce differs", async () => {
  process.env.RESET_PASSWORD_SECRET = "reset-secret";
  const otpExpiryMs = Date.now() + 60 * 1000;
  let updateCall;
  const currentResetState = {
    otp: "654321",
    otpExpiry: new Date(otpExpiryMs),
    otpPurpose: PASSWORD_RESET_PURPOSE,
    resetPasswordNonce: "new-reset-nonce",
  };
  const admin = {
    findById: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      isDisabled: false,
      ...currentResetState,
    }),
    updateOne: async (query, update) => {
      updateCall = { query, update };
      const wouldMatchCurrentMongoState =
        query.otp?.$exists === true &&
        query.otp?.$ne === null &&
        query.otpPurpose === currentResetState.otpPurpose &&
        query.otpExpiry?.$eq?.getTime?.() === otpExpiryMs &&
        (query.resetPasswordNonce === undefined ||
          query.resetPasswordNonce === currentResetState.resetPasswordNonce);

      return { modifiedCount: wouldMatchCurrentMongoState ? 1 : 0 };
    },
  };
  const { resetPassword } = loadAdminController({
    admin,
    jwt: {
      sign: () => assert.fail("sign should not run while resetting password"),
      verify: () => ({
        id: "admin-1",
        otpExpiry: otpExpiryMs,
        resetPasswordNonce: "old-reset-nonce",
      }),
    },
    bcrypt: {
      compare: async () => true,
      hash: async () => "hashed-new-password",
    },
  });
  const res = createResponse();

  await resetPassword(
    { body: { token: "older-token", newPassword: "ValidPass1!" } },
    res
  );

  assert.equal(updateCall.query.resetPasswordNonce, "old-reset-nonce");
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { message: INVALID_RESET_TOKEN_MESSAGE });
});

test("resetPassword rejects replay after reset state is consumed", async () => {
  process.env.RESET_PASSWORD_SECRET = "reset-secret";
  const otpExpiryMs = Date.now() + 60 * 1000;
  let resetStateAvailable = true;
  const admin = {
    findById: async () => ({
      _id: "admin-1",
      email: "active@example.com",
      isDisabled: false,
      otp: resetStateAvailable ? "123456" : null,
      otpExpiry: resetStateAvailable ? new Date(otpExpiryMs) : null,
      otpPurpose: resetStateAvailable ? PASSWORD_RESET_PURPOSE : null,
      resetPasswordNonce: resetStateAvailable ? "reset-nonce-1" : null,
    }),
    updateOne: async (query) => {
      const requiresResetState =
        query.otp?.$exists === true &&
        query.otp?.$ne === null &&
        query.otpExpiry?.$eq?.getTime?.() === otpExpiryMs &&
        query.resetPasswordNonce === "reset-nonce-1";

      if (requiresResetState && resetStateAvailable) {
        resetStateAvailable = false;
        return { modifiedCount: 1 };
      }

      return { modifiedCount: 0 };
    },
  };
  const { resetPassword } = loadAdminController({
    admin,
    jwt: {
      sign: () => assert.fail("sign should not run while resetting password"),
      verify: () => ({
        id: "admin-1",
        otpExpiry: otpExpiryMs,
        resetPasswordNonce: "reset-nonce-1",
      }),
    },
    bcrypt: {
      compare: async () => true,
      hash: async () => "hashed-new-password",
    },
  });
  const firstResponse = createResponse();
  const secondResponse = createResponse();

  await resetPassword(
    { body: { token: "valid-token", newPassword: "ValidPass1!" } },
    firstResponse
  );
  await resetPassword(
    { body: { token: "valid-token", newPassword: "ValidPass1!" } },
    secondResponse
  );

  assert.equal(firstResponse.statusCode, 200);
  assert.equal(secondResponse.statusCode, 400);
  assert.deepEqual(secondResponse.body, { message: INVALID_RESET_TOKEN_MESSAGE });
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

test("resendOtp stores a staff verification OTP purpose using crypto randomInt", async () => {
  const randomIntCalls = [];
  let savedAdmin;
  coreCrypto.randomInt = (min, max) => {
    randomIntCalls.push([min, max]);
    return 345678;
  };
  const staff = {
    _id: "admin-1",
    email: "active@example.com",
    isVerified: false,
    save: async function save() {
      savedAdmin = { ...this };
    },
  };
  const admin = { findOne: async () => staff };
  const { resendOtp } = loadAdminController({ admin });
  const res = createResponse();

  await resendOtp({ body: { email: "active@example.com" } }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(randomIntCalls, [[100000, 1000000]]);
  assert.equal(savedAdmin.otp, "345678");
  assert.ok(Number(savedAdmin.otpExpiry) > Date.now());
  assert.equal(savedAdmin.otpPurpose, STAFF_VERIFICATION_PURPOSE);
});

test("Admin schema exposes optional OTP purpose and reset nonce fields", () => {
  clearControllerCache();
  const Admin = require("../models/Admin");
  const otpPurposePath = Admin.schema.path("otpPurpose");
  const resetPasswordNoncePath = Admin.schema.path("resetPasswordNonce");

  assert.ok(otpPurposePath);
  assert.deepEqual([...otpPurposePath.enumValues].sort(), [
    PASSWORD_RESET_PURPOSE,
    STAFF_VERIFICATION_PURPOSE,
  ]);
  assert.equal(otpPurposePath.defaultValue, null);
  assert.ok(resetPasswordNoncePath);
  assert.equal(resetPasswordNoncePath.instance, "String");
  assert.equal(resetPasswordNoncePath.defaultValue, null);
});

test("npm test includes adminController.test.js", () => {
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  assert.ok(
    packageJson.scripts.test.includes("controllers/adminController.test.js")
  );
});
