import nodemailer from 'nodemailer';

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content (optional)
 * @param {string} options.html - HTML content (optional)
 */
export const sendEmail = async (options) => {
  // Skip email sending in test environment
  if (process.env.NODE_ENV === 'test') {
    return {
      messageId: 'test-message-id',
      accepted: [options.to],
      rejected: [],
      response: 'Test email skipped',
    };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Email options
  const mailOptions = {
    from: `${process.env.SMTP_FROM || process.env.SMTP_USER}`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  // Send email
  const info = await transporter.sendMail(mailOptions);

  console.log('Email sent:', info.messageId);
  return info;
};
