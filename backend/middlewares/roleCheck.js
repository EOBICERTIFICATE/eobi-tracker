const { User, Certificate } = require('../models');

const roleCheck = {
  regionAccess: (req, res, next) => {
    // For non-admin roles, restrict access to their region only
    if (!['super_admin', 'admin', 'chairman', 'ddg'].includes(req.userRole)) {
      req.query.regionId = req.userRegionId;
    }
    next();
  },

  beatOfficerAccess: async (req, res, next) => {
    if (req.userRole === 'beat_officer') {
      const user = await User.findByPk(req.userId);
      const beatCodes = JSON.parse(user.beatCodes);
      
      // For certificate routes
      if (req.params.certificateId) {
        const certificate = await Certificate.findByPk(req.params.certificateId);
        if (!beatCodes.includes(certificate.beatCode)) {
          return res.status(403).json({ 
            message: 'Access restricted to assigned beat codes only' 
          });
        }
      }
      
      // For query filters
      if (req.query.beatCode && !beatCodes.includes(req.query.beatCode)) {
        return res.status(403).json({ 
          message: 'Access restricted to assigned beat codes only' 
        });
      }
    }
    next();
  },

  btsAccess: async (req, res, next) => {
    if (req.userRole === 'bts') {
      const user = await User.findByPk(req.userId);
      
      // Restrict BTS to their region only
      if (req.query.regionId && req.query.regionId !== user.regionId) {
        return res.status(403).json({ 
          message: 'Access restricted to your assigned region only' 
        });
      }
    }
    next();
  }
};

module.exports = roleCheck;
