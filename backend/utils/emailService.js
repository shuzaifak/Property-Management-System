// backend/utils/emailService.js
const nodemailer = require('nodemailer');
const { emailUser, emailPass } = require('../config/config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

module.exports = {
  sendEmail: async (to, subject, text) => {
    await transporter.sendMail({ from: emailUser, to, subject, text });
  },
};
