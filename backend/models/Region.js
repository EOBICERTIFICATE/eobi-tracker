module.exports = (sequelize, DataTypes) => {
  const Region = sequelize.define('Region', {
    code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ddgBAndC: {
      type: DataTypes.ENUM('1', '2', '3'),
      allowNull: false
    }
  });

  Region.associate = models => {
    Region.hasMany(models.User, { foreignKey: 'regionId' });
    Region.hasMany(models.Certificate, { foreignKey: 'regionId' });
    Region.hasMany(models.Beat, { foreignKey: 'regionId' });
  };

  return Region;
};
