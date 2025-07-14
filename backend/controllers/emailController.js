const { Certificate, User } = require('../models');
const { transporter, emailTemplates } = require('../config/email');

const emailController = {
  processIncomingEmails: async (req, res) => {
    try {
      const Imap = require('imap');
      const { simpleParser } = require('mailparser');
      const imap = new Imap({
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASS,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
      });

      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err, box) => {
          if (err) throw err;

          imap.search(['UNSEEN'], (err, results) => {
            if (err) throw err;

            const fetch = imap.fetch(results, { bodies: '' });
            fetch.on('message', (msg) => {
              msg.on('body', (stream) => {
                simpleParser(stream, async (err, mail) => {
                  if (err) throw err;

                  // Extract certificate data from email
                  const text = mail.text || '';
                  const lines = text.split('\n');
                  
                  const data = {
                    claimantName: lines.find(line => line.startsWith('Name:'))?.split(':')[1]?.trim(),
                    cnic: lines.find(line => line.startsWith('CNIC:'))?.split(':')[1]?.trim(),
                    beatCode: lines.find(line => line.startsWith('Beat:'))?.split(':')[1]?.trim(),
                    regionId: lines.find(line => line.startsWith('Region:'))?.split(':')[1]?.trim()
                  };

                  if (data.cnic && data.beatCode && data.regionId) {
                    await Certificate.create({
                      trackingId: generateTrackingId(data.regionId, data.beatCode),
                      claimantName: data.claimantName,
                      cnic: data.cnic,
                      beatCode: data.beatCode,
                      regionId: data.regionId,
                      assignedById: req.userId,
                      status: 'Pending',
                      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
                    });
                  }

                  // Mark as read
                  imap.addFlags(msg.uid, ['\\Seen'], (err) => {
                    if (err) console.error('Could not mark as read:', err);
                  });
                });
              });
            });

            fetch.once('end', () => {
              imap.end();
              res.json({ message: 'Emails processed successfully' });
            });
          });
        });
      });

      imap.once('error', (err) => {
        console.error('IMAP error:', err);
        res.status(500).json({ message: 'IMAP processing failed', error: err.message });
      });

      imap.connect();

    } catch (error) {
      console.error('Email processing error:', error);
      res.status(500).json({ message: 'Email processing failed', error: error.message });
    }
  },

  sendReminder: async (req, res) => {
    try {
      const { certificateId } = req.params;
      const certificate = await Certificate.findByPk(certificateId, {
        include: [{ model: User, as: 'assignedTo' }]
      });

      if (!certificate) {
        return res.status(404).json({ message: 'Certificate not found' });
      }

      if (!certificate.assignedTo) {
        return res.status(400).json({ message: 'No beat officer assigned' });
      }

      await transporter.sendMail({
        to: certificate.assignedTo.email,
        subject: `Reminder: Pending Certificate - ${certificate.trackingId}`,
        html: `
          <p>Dear ${certificate.assignedTo.name},</p>
          <p>This is a reminder for the following pending certificate:</p>
          <p><strong>Tracking ID:</strong> ${certificate.trackingId}</p>
          <p><strong>Claimant:</strong> ${certificate.claimantName}</p>
          <p><strong>Due Date:</strong> ${certificate.dueDate.toLocaleDateString()}</p>
          <p>Please complete the verification at your earliest convenience.</p>
        `
      });

      res.json({ message: 'Reminder sent successfully' });

    } catch (error) {
      console.error('Reminder error:', error);
      res.status(500).json({ message: 'Failed to send reminder', error: error.message });
    }
  }
};

module.exports = emailController;
