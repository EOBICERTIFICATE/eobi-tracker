const { Certificate, User } = require('../models');
const { sendReminderEmail } = require('./emailService');
const moment = require('moment');

module.exports = {
  checkForReminders: async () => {
    try {
      const reminderThresholds = [
        { days: 15, type: 'First' },
        { days: 21, type: 'Second' },
        { days: 30, type: 'Final' }
      ];

      const pendingCertificates = await Certificate.findAll({
        where: { 
          status: 'Pending',
          escalationLevel: { [Op.lt]: 3 } // Only non-escalated certificates
        },
        include: [
          { model: User, as: 'assignedTo' }
        ]
      });

      const now = moment();
      const remindersSent = [];

      for (const cert of pendingCertificates) {
        const daysPending = now.diff(moment(cert.createdAt), 'days');
        
        for (const threshold of reminderThresholds) {
          if (daysPending >= threshold.days && 
              cert.lastReminderDay !== threshold.days) {
            
            if (cert.assignedTo) {
              await sendReminderEmail(cert, threshold.type);
              cert.lastReminderDay = threshold.days;
              await cert.save();
              remindersSent.push({
                trackingId: cert.trackingId,
                type: threshold.type,
                to: cert.assignedTo.email
              });
            }
            break; // Only send one reminder per certificate
          }
        }
      }

      if (remindersSent.length > 0) {
        console.log(`Sent ${remindersSent.length} reminders:`, remindersSent);
      }

      return remindersSent;
    } catch (error) {
      console.error('Reminder processing error:', error);
      throw error;
    }
  },

  sendManualReminder: async (certificateId) => {
    try {
      const certificate = await Certificate.findByPk(certificateId, {
        include: [
          { model: User, as: 'assignedTo' }
        ]
      });

      if (!certificate || !certificate.assignedTo) {
        return null;
      }

      const daysPending = moment().diff(moment(certificate.createdAt), 'days');
      let reminderType;
      
      if (daysPending >= 30) reminderType = 'Final';
      else if (daysPending >= 21) reminderType = 'Second';
      else reminderType = 'First';

      await sendReminderEmail(certificate, reminderType);
      certificate.lastReminderDay = daysPending;
      await certificate.save();

      return {
        trackingId: certificate.trackingId,
        type: reminderType,
        daysPending,
        recipient: certificate.assignedTo.email
      };
    } catch (error) {
      console.error('Manual reminder error:', error);
      throw error;
    }
  }
};