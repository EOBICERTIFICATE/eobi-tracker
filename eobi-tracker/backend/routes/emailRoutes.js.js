const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { authenticate, authorize } = require('../middlewares/auth');

// Email processing routes
router.post('/process-emails',
  authenticate,
  authorize(['bts', 'admin']),
  emailController.processIncomingEmails
);

router.post('/certificates/:certificateId/remind',
  authenticate,
  authorize(['bts', 'admin', 'rh', 'drh']),
  emailController.sendReminder
);

// Bulk reminder routes
router.post('/reminders/daily',
  authenticate,
  authorize(['admin']),
  emailController.sendDailyReminders
);

router.post('/reminders/escalations',
  authenticate,
  authorize(['admin']),
  emailController.sendEscalationNotifications
);

// Email templates management
router.get('/templates',
  authenticate,
  authorize(['admin']),
  emailController.getTemplates
);

router.put('/templates/:templateType',
  authenticate,
  authorize(['admin']),
  emailController.updateTemplate
);

module.exports = router;