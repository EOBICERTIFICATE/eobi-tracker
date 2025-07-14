const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/verify/:userId', authenticate, authController.verifyBeatOfficer);
router.post('/reset-password', authenticate, authController.requestPasswordReset);
router.post('/change-password', authenticate, authController.changePassword);

// Admin-only routes
router.post('/verify-beat-officer/:userId', 
  authenticate, 
  (req, res, next) => {
    if (!['super_admin', 'admin'].includes(req.userRole)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
  },
  authController.verifyBeatOfficer
);

module.exports = router;