const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Custom function to initialize database
db.initialize = async () => {
  // Create default roles if not exists
  const { User, Region } = db;
  const superAdminExists = await User.findOne({ where: { role: 'super_admin' } });
  
  if (!superAdminExists) {
    await User.create({
      name: 'Super Admin',
      email: 'superadmin@eobi.gov.pk',
      password: 'Admin@123',
      personalNumber: 'SA-001',
      role: 'super_admin',
      isVerified: true
    });
    
    // Create default regions
    const regions = [
      { code: '2100', name: 'Multan', ddgBAndC: '2' },
      { code: '3100', name: 'Mangamandi', ddgBAndC: '2' }
      // Add more default regions as needed
    ];
    
    await Region.bulkCreate(regions);
  }
};

module.exports = db;
