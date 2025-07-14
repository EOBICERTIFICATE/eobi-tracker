require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Unable to connect:', err));

// Sync Models
sequelize.sync({ alter: true });

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/certificates', require('./routes/certificateRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));