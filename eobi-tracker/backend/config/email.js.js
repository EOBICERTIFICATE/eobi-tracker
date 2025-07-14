const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const emailTemplates = {
  assignment: (certificate, beatOfficer) => ({
    from: `"EOBI Tracker System" <${process.env.EMAIL_USER}>`,
    to: beatOfficer.email,
    subject: `New Certificate Assigned - ${certificate.trackingId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c5282;">New Certificate Assignment</h2>
        <p>Dear ${beatOfficer.name},</p>
        <p>You have been assigned a new certificate for verification:</p>
        
        <div style="background: #f7fafc; padding: 16px; border-left: 4px solid #2b6cb0;">
          <p><strong>Tracking ID:</strong> ${certificate.trackingId}</p>
          <p><strong>Claimant:</strong> ${certificate.claimantName}</p>
          <p><strong>CNIC:</strong> ${certificate.cnic}</p>
          <p><strong>Beat Code:</strong> ${certificate.beatCode}</p>
          <p><strong>Due Date:</strong> ${new Date(certificate.dueDate).toLocaleDateString()}</p>
        </div>

        <p style="margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL}/certificates/${certificate.id}" 
             style="background: #4299e1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            View Certificate
          </a>
        </p>

        <p style="margin-top: 24px; font-size: 0.9em; color: #718096;">
          This is an automated message. Please do not reply directly to this email.
        </p>
      </div>
    `
  }),
  // Add other templates here
};

module.exports = { transporter, emailTemplates };