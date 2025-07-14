const { Certificate, User, Region } = require('../models');
const { transporter, emailTemplates } = require('../config/email');
const { generateTrackingId } = require('../utils/generateTrackingId');
const { uploadToDrive } = require('../utils/driveUploader');

const certificateController = {
  createCertificate: async (req, res) => {
    try {
      const { 
        firNumber,
        claimantName,
        fatherName,
        eobiNumber,
        cnic,
        employerName,
        employerMainCode,
        employerSubCode,
        beatCode,
        regionId
      } = req.body;

      // Validate required fields
      if (!cnic || !claimantName || !beatCode || !regionId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Generate unique tracking ID
      const trackingId = generateTrackingId(regionId, beatCode);

      // Calculate due date (15 days from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      const certificate = await Certificate.create({
        trackingId,
        firNumber,
        claimantName,
        fatherName,
        eobiNumber,
        cnic,
        employerName,
        employerMainCode,
        employerSubCode,
        beatCode,
        regionId,
        assignedById: req.userId,
        dueDate,
        status: 'Pending'
      });

      res.status(201).json(certificate);

    } catch (error) {
      console.error('Certificate creation error:', error);
      res.status(500).json({ message: 'Failed to create certificate', error: error.message });
    }
  },

  assignCertificate: async (req, res) => {
    try {
      const { certificateId } = req.params;
      const { beatOfficerId } = req.body;

      const certificate = await Certificate.findByPk(certificateId);
      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      const beatOfficer = await User.findByPk(beatOfficerId);
      if (!beatOfficer || beatOfficer.role !== 'beat_officer') {
        return res.status(400).json({ message: 'Invalid beat officer' });
      }

      // Verify beat officer has this beat code
      const beatCodes = JSON.parse(beatOfficer.beatCodes);
      if (!beatCodes.includes(certificate.beatCode)) {
        return res.status(403).json({ 
          message: 'Beat officer is not assigned to this beat code' 
        });
      }

      certificate.assignedToId = beatOfficerId;
      await certificate.save();

      // Send assignment email
      await transporter.sendMail(
        emailTemplates.assignment(certificate, beatOfficer)
      );

      res.json({ 
        message: 'Certificate assigned successfully',
        certificate 
      });

    } catch (error) {
      console.error('Assignment error:', error);
      res.status(500).json({ message: 'Assignment failed', error: error.message });
    }
  },

  uploadVerification: async (req, res) => {
    try {
      const { certificateId } = req.params;
      const { file } = req;

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const certificate = await Certificate.findByPk(certificateId);
      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      // Upload to Google Drive
      const fileUrl = await uploadToDrive(file, certificate.trackingId);

      certificate.pdfUrl = fileUrl;
      certificate.status = 'Verified';
      certificate.verifiedAt = new Date();
      await certificate.save();

      // Notify BTS officer
      const btsOfficer = await User.findByPk(certificate.assignedById);
      if (btsOfficer) {
        await transporter.sendMail({
          to: btsOfficer.email,
          subject: `Certificate Verified - ${certificate.trackingId}`,
          html: `
            <p>The certificate ${certificate.trackingId} has been verified by the beat officer.</p>
            <p><a href="${fileUrl}">View Verified Document</a></p>
          `
        });
      }

      res.json({ 
        message: 'Verification uploaded successfully',
        certificate 
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  },

  rejectCertificate: async (req, res) => {
    try {
      const { certificateId } = req.params;
      const { reason } = req.body;

      const certificate = await Certificate.findByPk(certificateId);
      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      certificate.status = 'Rejected';
      certificate.rejectionReason = reason;
      await certificate.save();

      // Notify BTS officer
      const btsOfficer = await User.findByPk(certificate.assignedById);
      if (btsOfficer) {
        await transporter.sendMail({
          to: btsOfficer.email,
          subject: `Certificate Rejected - ${certificate.trackingId}`,
          html: `
            <p>The certificate ${certificate.trackingId} has been rejected by the beat officer.</p>
            <p><strong>Reason:</strong> ${reason}</p>
          `
        });
      }

      res.json({ 
        message: 'Certificate rejected successfully',
        certificate 
      });

    } catch (error) {
      console.error('Rejection error:', error);
      res.status(500).json({ message: 'Rejection failed', error: error.message });
    }
  },

  getCertificates: async (req, res) => {
    try {
      const { status, regionId, beatCode } = req.query;
      const where = {};

      if (status) where.status = status;
      if (regionId) where.regionId = regionId;
      if (beatCode) where.beatCode = beatCode;

      // For beat officers, only show their assigned beat codes
      if (req.userRole === 'beat_officer') {
        const user = await User.findByPk(req.userId);
        where.beatCode = JSON.parse(user.beatCodes);
      }

      const certificates = await Certificate.findAll({ 
        where,
        include: [
          { model: User, as: 'assignedBy', attributes: ['id', 'name', 'email'] },
          { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] },
          { model: Region, attributes: ['id', 'name', 'code'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json(certificates);

    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch certificates', error: error.message });
    }
  }
};

module.exports = certificateController;