const { Region, Certificate } = require('../models');
const moment = require('moment');

module.exports = async (regionId, beatCode) => {
  try {
    // Get region code
    const region = await Region.findByPk(regionId);
    if (!region) {
      throw new Error('Region not found');
    }

    // Get current year and month (YYMM format)
    const dateCode = moment().format('YYMM');

    // Find the last certificate for this region+beat
    const lastCertificate = await Certificate.findOne({
      where: {
        regionId,
        beatCode
      },
      order: [['createdAt', 'DESC']],
      attributes: ['trackingId']
    });

    let sequence = 1;
    if (lastCertificate) {
      const parts = lastCertificate.trackingId.split('-');
      const lastSequence = parseInt(parts[2]);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    // Format sequence with leading zeros
    const sequenceCode = sequence.toString().padStart(4, '0');

    return `${region.code}-${beatCode}-${sequenceCode}`;
  } catch (error) {
    console.error('Tracking ID generation error:', error);
    throw error;
  }
};
