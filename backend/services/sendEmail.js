const SibApiV3Sdk = require("sib-api-v3-sdk");
const nodemailer = require("nodemailer");

const normalizeEnvValue = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().replace(/^['"]|['"]$/g, "").replace(/\r?\n/g, "");
};

const sendWithBrevo = async ({ to, subject, text, html }) => {
  const apiKey = normalizeEnvValue(
    process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY
  );
  if (!apiKey) throw new Error("BREVO_API_KEY is not configured.");
  if (!apiKey.startsWith("xkeysib-")) {
    throw new Error("BREVO_API_KEY appears malformed.");
  }
  SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey = apiKey;
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const senderEmail = normalizeEnvValue(process.env.BREVO_SENDER_EMAIL);
  const senderName = normalizeEnvValue(process.env.BREVO_SENDER_NAME);
  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL environment variable is not set.");
  }
  if (!senderName) {
    throw new Error("BREVO_SENDER_NAME environment variable is not set.");
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.sender = { email: senderEmail, name: senderName };
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.textContent = text;
  if (html) {
    sendSmtpEmail.htmlContent = html;
  }

  await apiInstance.sendTransacEmail(sendSmtpEmail);
};

const getSmtpConfig = () => {
  const user = normalizeEnvValue(process.env.EMAIL_USER);
  const pass = normalizeEnvValue(process.env.EMAIL_PASS);
  if (!user || !pass) return null;

  return {
    user,
    pass,
    senderName:
      normalizeEnvValue(process.env.BREVO_SENDER_NAME) || "Baobab Vision",
  };
};

const sendWithSmtp = async ({ to, subject, text, html }) => {
  const smtpConfig = getSmtpConfig();
  if (!smtpConfig) {
    throw new Error("EMAIL_USER and EMAIL_PASS are not configured.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpConfig.user,
      pass: smtpConfig.pass,
    },
  });

  const mailOptions = {
    from: `${smtpConfig.senderName} <${smtpConfig.user}>`,
    to,
    subject,
    text,
  };
  if (html) mailOptions.html = html;

  await transporter.sendMail(mailOptions);
};

/**
 * Sends an email using Brevo first, then falls back to SMTP if configured.
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} text - Fallback plain text
 * @param {string} html - Optional HTML content (e.g., buttons)
 */
const sendEmail = async (to, subject, text, html = null) => {
  const smtpConfig = getSmtpConfig();
  const brevoApiKey = normalizeEnvValue(
    process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY
  );

  if (brevoApiKey) {
    try {
      await sendWithBrevo({ to, subject, text, html });
      console.info("Sent email via Brevo", { to, subject });
      return;
    } catch (brevoError) {
      const responseStatus = brevoError?.response?.status;
      const responseBody =
        brevoError?.response?.body || brevoError?.response?.text;
      console.error("Failed to send email via Brevo:", {
        message: brevoError.message,
        code: brevoError.code,
        responseStatus,
        responseBody,
        stack: brevoError.stack,
      });

      if (!smtpConfig) {
        throw new Error(brevoError.message);
      }
    }
  }

  if (smtpConfig) {
    try {
      await sendWithSmtp({ to, subject, text, html });
      console.info("Sent email via SMTP", { to, subject });
      return;
    } catch (smtpError) {
      console.error("Failed to send email via SMTP fallback:", {
        message: smtpError.message,
        code: smtpError.code,
        stack: smtpError.stack,
      });
      throw new Error(smtpError.message);
    }
  }

  throw new Error(
    "No email provider configured. Set BREVO_API_KEY or EMAIL_USER and EMAIL_PASS."
  );
};

module.exports = sendEmail;
