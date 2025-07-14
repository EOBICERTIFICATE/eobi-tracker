module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    personalNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM(
        'super_admin',
        'admin',
        'chairman',
        'ddg',
        'rh',
        'drh',
        'bts',
        'bts_fo',
        'beat_officer'
      ),
      allowNull: false
    },
    beatCodes: {
      type: DataTypes.TEXT,
      get() {
        const rawValue = this.getDataValue('beatCodes');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('beatCodes', JSON.stringify(value || []));
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: function() {
        return this.role !== 'beat_officer';
      }
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const bcrypt = require('bcryptjs');
          user.password = await bcrypt.hash(user.password, 10);
        }
        // BTS FO users inherit region from parent BTS
        if (user.role === 'bts_fo' && !user.regionId) {
          const parentBTS = await sequelize.models.User.findOne({
            where: { role: 'bts', regionId: user.regionId }
          });
          if (parentBTS) user.regionId = parentBTS.regionId;
        }
      }
    }
  });

  User.associate = models => {
    User.belongsTo(models.Region, { foreignKey: 'regionId' });
    User.hasMany(models.Certificate, { 
      as: 'assignedCertificates', 
      foreignKey: 'assignedToId' 
    });
    User.hasMany(models.Certificate, { 
      as: 'createdCertificates', 
      foreignKey: 'assignedById' 
    });
  };

  // Instance method for password verification
  User.prototype.validPassword = function(password) {
    const bcrypt = require('bcryptjs');
    return bcrypt.compareSync(password, this.password);
  };

  return User;
};