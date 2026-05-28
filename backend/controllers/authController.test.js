const test = require("node:test");
const assert = require("node:assert/strict");

const authControllerPath = require.resolve("./authController");
const userModelPath = require.resolve("../models/User");
const userPreferencesPath = require.resolve("../models/UserPreferences");
const userCartPath = require.resolve("../models/UserCart");
const sendEmailPath = require.resolve("../services/sendEmail");

const loadAuthController = ({ user, sendEmail }) => {
  delete require.cache[authControllerPath];
  require.cache[userModelPath] = {
    id: userModelPath,
    filename: userModelPath,
    loaded: true,
    exports: user,
  };
  require.cache[userPreferencesPath] = {
    id: userPreferencesPath,
    filename: userPreferencesPath,
    loaded: true,
    exports: function UserPreferences() {},
  };
  require.cache[userCartPath] = {
    id: userCartPath,
    filename: userCartPath,
    loaded: true,
    exports: {},
  };
  require.cache[sendEmailPath] = {
    id: sendEmailPath,
    filename: sendEmailPath,
    loaded: true,
    exports: sendEmail,
  };

  return require("./authController");
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
  delete require.cache[authControllerPath];
  delete require.cache[userModelPath];
  delete require.cache[userPreferencesPath];
  delete require.cache[userCartPath];
  delete require.cache[sendEmailPath];
});

test("requestOtp returns JSON when email sending fails", async () => {
  const user = {
    findOne: async () => ({
      _id: "user-1",
      email: "test@example.com",
      firstname: "Test",
    }),
    updateOne: async () => ({ modifiedCount: 1 }),
  };
  const sendEmail = async () => {
    throw new Error("email service unavailable");
  };
  const { requestOtp } = loadAuthController({ user, sendEmail });
  const res = createResponse();

  await silenceConsoleError(async () => {
    await assert.doesNotReject(() =>
      requestOtp({ body: { email: "test@example.com" } }, res)
    );
  });

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    message: "Unable to send OTP email. Please try again later.",
  });
});

test("resendOtp returns JSON when email sending fails", async () => {
  const user = {
    findOne: async () => ({
      _id: "user-1",
      email: "test@example.com",
      firstname: "Test",
    }),
    updateOne: async () => ({ modifiedCount: 1 }),
  };
  const sendEmail = async () => {
    throw new Error("email service unavailable");
  };
  const { resendOtp } = loadAuthController({ user, sendEmail });
  const res = createResponse();

  await silenceConsoleError(async () => {
    await assert.doesNotReject(() =>
      resendOtp({ body: { email: "test@example.com" } }, res)
    );
  });

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, {
    message: "Unable to resend OTP email. Please try again later.",
  });
});
