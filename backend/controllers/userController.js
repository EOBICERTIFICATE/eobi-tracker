const { User, Region } = require('../models');
const { transporter } = require('../config/email');

const userController = {
  createUser: async (req, res) => {
    try {
      const { name, email, password, role, personalNumber, regionId, beatCodes } = req.body;

      // Validate required fields
      if (!name || !email || !password || !role || !personalNumber) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Only super admin can create certain roles
      if (['super_admin', 'chairman', 'ddg'].includes(role) && req.userRole !== 'super_admin') {
        return res.status(403).json({ message: 'Unauthorized to create this role' });
      }

      // Validate region exists if provided
      if (regionId) {
        const region = await Region.findByPk(regionId);
        if (!region) {
          return res.status(400).json({ message: 'Region not found' });
        }
      }

      // Validate beat codes format
      if (beatCodes && (!Array.isArray(beatCodes) || beatCodes.length === 0)) {
        return res.status(400).json({ message: 'Invalid beat codes format' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role,
        personalNumber,
        regionId,
        beatCodes: JSON.stringify(beatCodes || []),
        isActive: true,
        isVerified: role !== 'beat_officer'
      });

      // Remove password from response
      const userJson = user.toJSON();
      delete userJson.password;

      res.status(201).json(userJson);

    } catch (error) {
      console.error('User creation error:', error);
      res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
  },

  getUsers: async (req, res) => {
    try {
      const { role, regionId } = req.query;
      const where = { isActive: true };

      if (role) where.role = role;
      if (regionId) where.regionId = regionId;

      // Restrict non-admins from seeing certain roles
      if (!['super_admin', 'admin'].includes(req.userRole)) {
        where.role = ['bts', 'beat_officer', 'rh', 'drh'];
      }

      const users = await User.findAll({
        where,
        attributes: { exclude: ['password'] },
        include: [{ model: Region, attributes: ['id', 'name', 'code'] }]
      });

      res.json(users);

    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prevent certain updates based on role
      if (updates.role && req.userRole !== 'super_admin') {
        return res.status(403).json({ message: 'Only super admin can change roles' });
      }

      // Handle beat officer verification
      if (updates.isVerified !== undefined && user.role === 'beat_officer') {
        if (req.userRole !== 'super_admin' && req.userRole !== 'admin') {
          return res.status(403).json({ message: 'Unauthorized to verify users' });
        }

        if (updates.isVerified && !user.isVerified) {
          await transporter.sendMail({
            to: user.email,
            subject: 'Your EOBI Tracker Account Has Been Verified',
            html: `
              <p>Dear ${user.name},</p>
              <p>Your account has been verified and you can now access the system.</p>
              <a href="${process.env.FRONTEND_URL}/login">Login to EOBI Tracker</a>
            `
          });
        }
      }

      // Update beat codes if provided
      if (updates.beatCodes) {
        if (!Array.isArray(updates.beatCodes)) {
          return res.status(400).json({ message: 'Beat codes must be an array' });
        }
        updates.beatCodes = JSON.stringify(updates.beatCodes);
      }

      await user.update(updates);

      // Remove password from response
      const userJson = user.toJSON();
      delete userJson.password;

      res.json(userJson);

    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
  },

  deactivateUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prevent deactivating certain roles
      if (['super_admin', 'chairman'].includes(user.role) {
        return res.status(403).json({ message: 'Cannot deactivate this user' });
      }

      await user.update({ isActive: false });

      res.json({ message: 'User deactivated successfully' });

    } catch (error) {
      console.error('Deactivation error:', error);
      res.status(500).json({ message: 'Failed to deactivate user', error: error.message });
    }
  }
};

module.exports = userController;
