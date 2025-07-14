const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { transporter, emailTemplates } = require('../config/email');
require('dotenv').config();

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role, personalNumber, regionId, beatCodes } = req.body;

      // Validate required fields
      if (!name || !email || !password || !role || !personalNumber) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        personalNumber,
        regionId,
        beatCodes: JSON.stringify(beatCodes || []),
        isVerified: role === 'beat_officer' ? false : true
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Send verification email for beat officers
      if (role === 'beat_officer') {
        await transporter.sendMail({
          from: `"EOBI Tracker Admin" <${process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL,
          subject: 'New Beat Officer Verification',
          html: `
            <p>A new beat officer requires verification:</p>
            <p>Name: ${name}</p>
            <p>Personal #: ${personalNumber}</p>
            <p>Region: ${regionId}</p>
            <p>Beat Codes: ${beatCodes.join(', ')}</p>
            <a href="${process.env.ADMIN_DASHBOARD_URL}/users/${user.id}/verify">Verify User</a>
          `
        });
      }

      res.status(201).json({
        userId: user.id,
        email: user.email,
        role: user.role,
        token,
        tokenExpiration: '1d'
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if beat officer is verified
      if (user.role === 'beat_officer' && !user.isVerified) {
        return res.status(403).json({ message: 'Your account is pending verification by admin' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        token,
        tokenExpiration: '1d'
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  verifyBeatOfficer: async (req, res) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findByPk(userId);
      if (!user || user.role !== 'beat_officer') {
        return res.status(404).json({ message: 'Beat officer not found' });
      }

      user.isVerified = true;
      await user.save();

      // Send welcome email to beat officer
      await transporter.sendMail({
        from: `"EOBI Tracker System" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your Account Has Been Verified',
        html: `
          <p>Dear ${user.name},</p>
          <p>Your account has been verified by the admin. You can now login to the system.</p>
          <p><strong>Your beat codes:</strong> ${JSON.parse(user.beatCodes).join(', ')}</p>
          <a href="${process.env.FRONTEND_URL}/login">Login to System</a>
        `
      });

      res.json({ message: 'Beat officer verified successfully' });

    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).json({ message: 'Verification failed', error: error.message });
    }
  }
};

module.exports = authController;