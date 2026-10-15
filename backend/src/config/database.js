const mongoose = require('mongoose');

// Disable buffering so operations fail fast when DB is not connected
mongoose.set('bufferCommands', false);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('⚠️  MONGODB_URI not set – running without database persistence.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('⚠️  MongoDB disconnected');
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('   Continuing without database – analysis sessions won\'t be persisted.');
  }
};

module.exports = connectDB;
