const test = require("node:test");
const assert = require("node:assert/strict");

const sendEmailPath = require.resolve("./sendEmail");
const brevoPath = require.resolve("sib-api-v3-sdk");
const nodemailerPath = require.resolve("nodemailer");

const trackedEnvKeys = [
  "BREVO_API_KEY",
  "SENDINBLUE_API_KEY",
  "BREVO_SENDER_EMAIL",
  "BREVO_SENDER_NAME",
  "EMAIL_USER",
  "EMAIL_PASS",
];
const originalEnv = Object.fromEntries(
  trackedEnvKeys.map((key) => [key, process.env[key]])
);

const restoreEnv = () => {
  for (const key of trackedEnvKeys) {
    if (typeof originalEnv[key] === "undefined") {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
};

const stubModule = (path, exports) => {
  require.cache[path] = {
    id: path,
    filename: path,
    loaded: true,
    exports,
  };
};

const loadSendEmail = ({ brevoSend, smtpSend }) => {
  delete require.cache[sendEmailPath];
  delete require.cache[brevoPath];
  delete require.cache[nodemailerPath];

  stubModule(brevoPath, {
    ApiClient: {
      instance: {
        authentications: {
          "api-key": {},
        },
      },
    },
    TransactionalEmailsApi: function TransactionalEmailsApi() {
      return {
        sendTransacEmail: brevoSend,
      };
    },
    SendSmtpEmail: function SendSmtpEmail() {},
  });

  stubModule(nodemailerPath, {
    createTransport(options) {
      return {
        options,
        sendMail: smtpSend,
      };
    },
  });

  return require("./sendEmail");
};

const captureConsoleInfo = async (callback) => {
  const originalConsoleInfo = console.info;
  const calls = [];
  console.info = (...args) => calls.push(args);
  try {
    await callback(calls);
  } finally {
    console.info = originalConsoleInfo;
  }
};

test.afterEach(() => {
  restoreEnv();
  delete require.cache[sendEmailPath];
  delete require.cache[brevoPath];
  delete require.cache[nodemailerPath];
});

test("sendEmail uses Brevo before SMTP when both providers are configured", async () => {
  process.env.BREVO_API_KEY = "xkeysib-disabled";
  process.env.BREVO_SENDER_EMAIL = "sender@example.com";
  process.env.BREVO_SENDER_NAME = "Baobab Vision";
  process.env.EMAIL_USER = "smtp@example.com";
  process.env.EMAIL_PASS = "smtp-password";

  let brevoCalls = 0;
  let smtpCalls = 0;
  const sendEmail = loadSendEmail({
    brevoSend: async () => {
      brevoCalls += 1;
    },
    smtpSend: async () => {
      smtpCalls += 1;
      throw new Error("SMTP should not be called");
    },
  });

  await captureConsoleInfo(async (infoCalls) => {
    await sendEmail("customer@example.com", "Subject", "Text body");

    assert.deepEqual(infoCalls, [
      ["Sent email via Brevo", { to: "customer@example.com", subject: "Subject" }],
    ]);
  });

  assert.equal(brevoCalls, 1);
  assert.equal(smtpCalls, 0);
});

test("sendEmail logs Brevo when SMTP is absent and Brevo succeeds", async () => {
  process.env.BREVO_API_KEY = "xkeysib-enabled";
  process.env.BREVO_SENDER_EMAIL = "sender@example.com";
  process.env.BREVO_SENDER_NAME = "Baobab Vision";
  delete process.env.EMAIL_USER;
  delete process.env.EMAIL_PASS;

  let brevoCalls = 0;
  const sendEmail = loadSendEmail({
    brevoSend: async () => {
      brevoCalls += 1;
    },
    smtpSend: async () => {
      throw new Error("SMTP should not be called");
    },
  });

  await captureConsoleInfo(async (infoCalls) => {
    await sendEmail("customer@example.com", "Subject", "Text body");

    assert.deepEqual(infoCalls, [
      ["Sent email via Brevo", { to: "customer@example.com", subject: "Subject" }],
    ]);
  });

  assert.equal(brevoCalls, 1);
});

test("sendEmail falls back to SMTP when Brevo rejects the configured key", async (t) => {
  t.mock.method(console, "error", () => {});
  process.env.BREVO_API_KEY = "xkeysib-disabled";
  process.env.BREVO_SENDER_EMAIL = "sender@example.com";
  process.env.BREVO_SENDER_NAME = "Baobab Vision";
  process.env.EMAIL_USER = "smtp@example.com";
  process.env.EMAIL_PASS = "smtp-password";

  let brevoCalls = 0;
  let smtpMessage;
  const sendEmail = loadSendEmail({
    brevoSend: async () => {
      brevoCalls += 1;
      const error = new Error("Unauthorized");
      error.response = {
        status: 401,
        body: { message: "API Key is not enabled", code: "unauthorized" },
      };
      throw error;
    },
    smtpSend: async (message) => {
      smtpMessage = message;
    },
  });

  await captureConsoleInfo(async (infoCalls) => {
    await sendEmail("customer@example.com", "Subject", "Text body", "<p>HTML</p>");

    assert.deepEqual(infoCalls, [
      ["Sent email via SMTP", { to: "customer@example.com", subject: "Subject" }],
    ]);
  });

  assert.equal(brevoCalls, 1);
  assert.deepEqual(smtpMessage, {
    from: "Baobab Vision <smtp@example.com>",
    to: "customer@example.com",
    subject: "Subject",
    text: "Text body",
    html: "<p>HTML</p>",
  });
});

test("sendEmail can use SMTP when Brevo is not configured", async () => {
  delete process.env.BREVO_API_KEY;
  delete process.env.SENDINBLUE_API_KEY;
  process.env.BREVO_SENDER_NAME = "Baobab Vision";
  process.env.EMAIL_USER = "smtp@example.com";
  process.env.EMAIL_PASS = "smtp-password";

  let smtpMessage;
  const sendEmail = loadSendEmail({
    brevoSend: async () => {
      throw new Error("Brevo should not be called");
    },
    smtpSend: async (message) => {
      smtpMessage = message;
    },
  });

  await captureConsoleInfo(async (infoCalls) => {
    await sendEmail("customer@example.com", "Subject", "Text body");

    assert.deepEqual(infoCalls, [
      ["Sent email via SMTP", { to: "customer@example.com", subject: "Subject" }],
    ]);
  });

  assert.equal(smtpMessage.from, "Baobab Vision <smtp@example.com>");
  assert.equal(smtpMessage.to, "customer@example.com");
});
