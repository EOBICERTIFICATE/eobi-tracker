const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const auth = {
  authenticate: async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user || !user.isActive) {
        return res.status(401).json({ message: 'Invalid or inactive account' });
      }

      req.userId = user.id;
      req.userRole = user.role;
      next();

    } catch (error) {
      console.error('Authentication error:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired, please login again' });
      }
      res.status(401).json({ message: 'Invalid authentication token' });
    }
  },

  authorize: (roles = []) => {
    return (req, res, next) => {
      if (!Array.isArray(roles)) {
        roles = [roles];
      }

      if (!roles.includes(req.userRole)) {
        return res.status(403).json({ 
          message: `Access forbidden. Required role: ${roles.join(' or ')}`
        });
      }

      next();
    };
  },

  verifyBeatOfficer: async (req, res, next) => {
    const user = await User.findByPk(req.userId);
    
    if (user.role === 'beat_officer' && !user.isVerified) {
      return res.status(403).json({ 
        message: 'Your account is pending verification by admin' 
      });
    }

    next();
  }
};

module.exports = auth;