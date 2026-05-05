const sgMail = require('@sendgrid/mail');
const { sendgridApiKey, emailUser } = require('../config/config');

// Initialize SendGrid
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
  console.log('SendGrid API Key initialized');
} else {
  console.warn('SENDGRID_API_KEY is not set. Emails will not be sent.');
}

/**
 * Standard Email Template Wrapper
 */
const wrapHtml = (content, subject) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f7f9;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
          }
          .header {
            background: linear-gradient(135deg, #1d4ed8, #3b82f6);
            color: #ffffff;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .content {
            padding: 40px 30px;
          }
          .footer {
            background-color: #f8fafc;
            color: #64748b;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
          }
          .info-box {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 15px;
            margin: 20px 0;
          }
          hr {
            border: 0;
            border-top: 1px solid #e2e8f0;
            margin: 25px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Property Sync</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Property Sync Management System</p>
            <p>Reliable Property Solutions</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Sends an email using SendGrid.
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content (will be wrapped in template)
 */
const sendEmail = async (to, subject, html) => {
  if (!sendgridApiKey) {
    console.error('Cannot send email: SENDGRID_API_KEY is missing');
    return null;
  }

  // Wrap the provided HTML in our standard template
  const finalHtml = wrapHtml(html, subject);

  const msg = {
    to,
    from: emailUser || 'noreply@propertysync.com',
    subject,
    text: html.replace(/<[^>]*>?/gm, ''), // Plain text fallback
    html: finalHtml,
  };

  try {
    const response = await sgMail.send(msg);
    console.log(`Email sent to ${to} via SendGrid`);
    return response;
  } catch (error) {
    console.error('SendGrid error:', error.response ? error.response.body : error);
    throw error;
  }
};

/**
 * Sends bulk emails using SendGrid.
 */
const sendBulkEmails = async (recipients, subject, html) => {
  const results = [];
  for (const recipient of recipients) {
    try {
      await sendEmail(recipient, subject, html);
      results.push({ email: recipient, status: 'success' });
    } catch (error) {
      results.push({ email: recipient, status: 'failed', error: error.message });
    }
  }
  return results;
};

module.exports = { 
  sendEmail,
  sendBulkEmails
};