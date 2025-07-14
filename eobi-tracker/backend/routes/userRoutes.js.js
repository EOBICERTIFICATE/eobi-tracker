const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const { regionAccess } = require('../middlewares/roleCheck');

// Apply authentication to all routes
router.use(authenticate);

// Apply region filtering for non-admin roles
router.use(regionAccess);

// User management routes
router.post('/',
  authorize(['super_admin', 'admin']),
  userController.createUser
);

router.get('/',
  authorize(['super_admin', 'admin', 'chairman', 'ddg', 'rh', 'drh', 'bts']),
  userController.getUsers
);

router.get('/:userId',
  authorize(['super_admin', 'admin', 'chairman', 'ddg', 'rh', 'drh', 'bts']),
  userController.getUser
);

router.put('/:userId',
  authorize(['super_admin', 'admin']),
  userController.updateUser
);

router.put('/:userId/beat-codes',
  authorize(['super_admin', 'admin', 'bts']),
  userController.updateBeatCodes
);

router.delete('/:userId',
  authorize(['super_admin', 'admin']),
  userController.deactivateUser
);

// Special endpoints for beat officers
router.get('/beat-officers/unverified',
  authorize(['super_admin', 'admin']),
  userController.getUnverifiedBeatOfficers
);

router.post('/beat-officers/:userId/verify',
  authorize(['super_admin', 'admin']),
  userController.verifyBeatOfficer
);

// Password management
router.post('/change-password',
  userController.changePassword
);

module.exports = router;