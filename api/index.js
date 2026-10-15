const app = require('../backend/src/app');
const connectDB = require('../backend/src/config/database');

connectDB().catch((err) => console.warn('DB connect warning:', err.message));

module.exports = app;
