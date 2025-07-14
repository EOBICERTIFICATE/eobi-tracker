const { Certificate, User } = require('../models');
const { transporter, emailTemplates } = require('../config/email');
const moment = require('moment');
require('dotenv').config();

module.exports = {
  sendAssignmentEmail: async (certificate, beatOfficer) => {
    try {
      const mailOptions = emailTemplates.assignment(certificate, beatOfficer);
      await transporter.sendMail(mailOptions);
      console.log(`Assignment email sent to ${beatOfficer.email}`);
    } catch (error) {
      console.error('Failed to send assignment email:', error);
    }
  },

  sendReminderEmail: async (certificate, reminderType) => {
    try {
      const beatOfficer = await User.findByPk(certificate.assignedToId);
      if (!beatOfficer) return;

      const daysPending = moment().diff(moment(certificate.createdAt), 'days');
      const subject = `Reminder: ${reminderType} - Certificate ${certificate.trackingId}`;

      let content = `
        <p>Dear ${beatOfficer.name},</p>
        <p>This is a ${reminderType} reminder for the following pending certificate:</p>
        <p><strong>Tracking ID:</strong> ${certificate.trackingId}</p>
        <p><strong>Claimant:</strong> ${certificate.claimantName}</p>
        <p><strong>Days Pending:</strong> ${daysPending}</p>
      `;

      if (reminderType === 'Final') {
        content += `
          <p style="color: red; font-weight: bold;">
            This is your final reminder before escalation.
          </p>
        `;
      }

      await transporter.sendMail({
        from: `"EOBI Tracker System" <${process.env.EMAIL_USER}>`,
        to: beatOfficer.email,
        subject,
        html: content
      });

      console.log(`${reminderType} reminder sent to ${beatOfficer.email}`);
    } catch (error) {
      console.error('Failed to send reminder email:', error);
    }
  },

  sendEscalationEmail: async (certificate) => {
    try {
      const [btsOfficer, beatOfficer, regionHead] = await Promise.all([
        User.findByPk(certificate.assignedById),
        User.findByPk(certificate.assignedToId),
        User.findOne({ where: { regionId: certificate.regionId, role: 'rh' } })
      ]);

      const recipients = [
        process.env.ADMIN_EMAIL,
        regionHead?.email,
        btsOfficer?.email
      ].filter(Boolean);

      const daysPending = moment().diff(moment(certificate.createdAt), 'days');

      await transporter.sendMail({
        from: `"EOBI Tracker System" <${process.env.EMAIL_USER}>`,
        to: recipients.join(','),
        subject: `ESCALATION: Certificate ${certificate.trackingId} Overdue`,
        html: `
          <p>An urgent escalation is required for the following certificate:</p>
          <p><strong>Tracking ID:</strong> ${certificate.trackingId}</p>
          <p><strong>Claimant:</strong> ${certificate.claimantName}</p>
          <p><strong>CNIC:</strong> ${certificate.cnic}</p>
          <p><strong>Days Pending:</strong> ${daysPending}</p>
          <p><strong>Assigned Beat Officer:</strong> ${beatOfficer?.name || 'Unassigned'}</p>
          <p style="color: red; font-weight: bold;">
            Immediate action is required to resolve this overdue case.
          </p>
        `
      });

      console.log(`Escalation sent for certificate ${certificate.trackingId}`);
    } catch (error) {
      console.error('Failed to send escalation email:', error);
    }
  }
};
