const nodemailer = require('nodemailer');
const { emailUser, emailPass } = require('../config/config');

// Validate email configuration
if (!emailUser || !emailPass) {
  console.error('Missing email configuration. Please check your .env file for EMAIL_USER and EMAIL_PASS');
  process.exit(1);
}

// Create transporter with more robust configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify the connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Enhanced sendEmail function with HTML support
const sendEmail = async (to, subject, html) => {
  try {
    // Validate all required parameters
    if (!to || !subject || !html) {
      throw new Error('Missing required email parameters');
    }

    // Prepare mail options with both HTML and plain text
    const mailOptions = {
      from: {
        name: 'Property Sync',
        address: emailUser
      },
      to,
      subject,
      html,
      text: html.replace(/<[^>]*>?/gm, '') // Convert HTML to plain text fallback
    };

    // Send email with detailed logging
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      recipient: to,
      subject: subject
    });

    return info;
  } catch (error) {
    console.error('Failed to send email:', {
      error: error.message,
      stack: error.stack,
      recipient: to,
      subject: subject
    });
    throw error;
  }
};

// Bulk email sending utility
const sendBulkEmails = async (recipients, subject, html) => {
  const results = [];
  for (const recipient of recipients) {
    try {
      const result = await sendEmail(recipient, subject, html);
      results.push({
        email: recipient,
        status: 'success',
        messageId: result.messageId
      });
    } catch (error) {
      results.push({
        email: recipient,
        status: 'failed',
        error: error.message
      });
    }
  }
  return results;
};

module.exports = { 
  sendEmail,
  sendBulkEmails
};