const SibApiV3Sdk = require("sib-api-v3-sdk");

const normalizeEnvValue = (value) => {
  if (typeof value !== "string") return value;
  return value.trim().replace(/^['"]|['"]$/g, "").replace(/\r?\n/g, "");
};

/**
 * Sends an email using Brevo (Sendinblue) SDK.
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} text - Fallback plain text
 * @param {string} html - Optional HTML content (e.g., buttons)
 */
const sendEmail = async (to, subject, text, html = null) => {
  const apiKey = normalizeEnvValue(
    process.env.BREVO_API_KEY || process.env.SENDINBLUE_API_KEY
  );
  if (!apiKey) {
    throw new Error(
      "BREVO_API_KEY environment variable is not set (or empty)."
    );
  }
  if (!apiKey.startsWith("xkeysib-")) {
    throw new Error(
      "BREVO_API_KEY appears malformed. Ensure it is a single-line Brevo key starting with xkeysib-."
    );
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

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    const responseStatus = error?.response?.status;
    const responseBody = error?.response?.body || error?.response?.text;
    console.error("Failed to send email via Brevo:", {
      message: error.message,
      code: error.code,
      responseStatus,
      responseBody,
      stack: error.stack,
    });
    throw new Error(error.message);
  }
};

module.exports = sendEmail;
