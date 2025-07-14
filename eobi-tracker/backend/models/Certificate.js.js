module.exports = (sequelize, DataTypes) => {
  const Certificate = sequelize.define('Certificate', {
    trackingId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    firNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    claimantName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fatherName: DataTypes.STRING,
    eobiNumber: DataTypes.STRING,
    cnic: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        is: /^[0-9]{5}-[0-9]{7}-[0-9]$/ // Validate CNIC format
      }
    },
    employerName: DataTypes.STRING,
    employerMainCode: DataTypes.STRING,
    employerSubCode: DataTypes.STRING,
    beatCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Verified', 'Rejected', 'Escalated'),
      defaultValue: 'Pending'
    },
    pdfUrl: DataTypes.STRING,
    rejectionReason: DataTypes.TEXT,
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    verifiedAt: DataTypes.DATE,
    escalationLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    hooks: {
      beforeCreate: (certificate) => {
        // Set default due date (15 days from creation)
        if (!certificate.dueDate) {
          certificate.dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
        }
      }
    }
  });

  Certificate.associate = models => {
    Certificate.belongsTo(models.Region, { foreignKey: 'regionId' });
    Certificate.belongsTo(models.User, { 
      as: 'assignedBy', 
      foreignKey: 'assignedById' 
    });
    Certificate.belongsTo(models.User, { 
      as: 'assignedTo', 
      foreignKey: 'assignedToId' 
    });
  };

  return Certificate;
};