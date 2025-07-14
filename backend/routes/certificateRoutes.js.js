const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticate, authorize } = require('../middlewares/auth');
const { regionAccess, beatOfficerAccess } = require('../middlewares/roleCheck');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Apply authentication to all routes
router.use(authenticate);

// Apply region access control
router.use(regionAccess);

// Certificate CRUD routes
router.post('/', 
  authorize(['bts', 'bts_fo', 'admin']), 
  certificateController.createCertificate
);

router.get('/', 
  authorize(['super_admin', 'admin', 'chairman', 'ddg', 'rh', 'drh', 'bts', 'bts_fo', 'beat_officer']),
  beatOfficerAccess,
  certificateController.getCertificates
);

router.post('/:certificateId/assign', 
  authorize(['bts', 'bts_fo', 'admin']),
  certificateController.assignCertificate
);

router.post('/:certificateId/verify',
  authorize(['beat_officer']),
  upload.single('pdf'),
  certificateController.uploadVerification
);

router.post('/:certificateId/reject',
  authorize(['beat_officer']),
  certificateController.rejectCertificate
);

// Reminder routes
router.post('/:certificateId/remind',
  authorize(['bts', 'bts_fo', 'admin', 'rh', 'drh']),
  certificateController.sendReminder
);

module.exports = router;