const { Certificate, User } = require('../models');
const { sendEscalationEmail } = require('./emailService');
const moment = require('moment');

module.exports = {
  checkForEscalations: async () => {
    try {
      const overdueThreshold = 45; // days
      const pendingCertificates = await Certificate.findAll({
        where: { status: 'Pending' },
        include: [
          { model: User, as: 'assignedTo' },
          { model: User, as: 'assignedBy' }
        ]
      });

      const now = moment();
      const escalations = [];

      for (const cert of pendingCertificates) {
        const daysPending = now.diff(moment(cert.createdAt), 'days');
        
        if (daysPending >= overdueThreshold && cert.escalationLevel < 3) {
          cert.escalationLevel = 3;
          cert.status = 'Escalated';
          await cert.save();
          
          await sendEscalationEmail(cert);
          escalations.push(cert.trackingId);
        }
        else if (daysPending >= 30 && cert.escalationLevel < 2) {
          cert.escalationLevel = 2;
          await cert.save();
          
          await sendEscalationEmail(cert);
          escalations.push(cert.trackingId);
        }
      }

      if (escalations.length > 0) {
        console.log(`Processed ${escalations.length} escalations:`, escalations);
      }

      return escalations;
    } catch (error) {
      console.error('Escalation processing error:', error);
      throw error;
    }
  },

  escalateSingleCertificate: async (certificateId) => {
    try {
      const certificate = await Certificate.findByPk(certificateId, {
        include: [
          { model: User, as: 'assignedTo' },
          { model: User, as: 'assignedBy' }
        ]
      });

      if (!certificate || certificate.status !== 'Pending') {
        return null;
      }

      const daysPending = moment().diff(moment(certificate.createdAt), 'days');
      certificate.escalationLevel = Math.min(3, certificate.escalationLevel + 1);
      
      if (daysPending >= 45) {
        certificate.status = 'Escalated';
      }

      await certificate.save();
      await sendEscalationEmail(certificate);

      return certificate;
    } catch (error) {
      console.error('Single escalation error:', error);
      throw error;
    }
  }
};
