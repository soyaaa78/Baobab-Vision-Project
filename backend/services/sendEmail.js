const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for SSL, false for TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email with optional HTML content.
 * @param {string} to - Recipient email
 * @param {string} subject - Subject line
 * @param {string} text - Fallback plain text
 * @param {string} html - Optional HTML content (e.g., buttons)
 */
const sendEmail = async (to, subject, text, html = null) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    ...(html && { html }), // Add HTML content if provided
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send email:", {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack,
    });
    throw new Error(error.message);
  }
};

module.exports = sendEmail;
