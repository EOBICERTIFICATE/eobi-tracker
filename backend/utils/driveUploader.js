const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
  scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });

module.exports = {
  uploadToDrive: async (file, trackingId) => {
    try {
      const fileMetadata = {
        name: `EOBI_${trackingId}_${Date.now()}${path.extname(file.originalname)}`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      };

      const media = {
        mimeType: file.mimetype,
        body: fs.createReadStream(file.path)
      };

      const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,webViewLink'
      });

      // Delete the temporary file
      fs.unlinkSync(file.path);

      return response.data.webViewLink || 
             `https://drive.google.com/file/d/${response.data.id}/view`;
    } catch (error) {
      console.error('Google Drive upload error:', error);
      throw error;
    }
  },

  deleteFromDrive: async (fileId) => {
    try {
      await drive.files.delete({
        fileId: fileId
      });
      return true;
    } catch (error) {
      console.error('Google Drive delete error:', error);
      throw error;
    }
  },

  createFolder: async (folderName) => {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      };

      const response = await drive.files.create({
        resource: fileMetadata,
        fields: 'id'
      });

      return response.data.id;
    } catch (error) {
      console.error('Google Drive folder creation error:', error);
      throw error;
    }
  }
};
