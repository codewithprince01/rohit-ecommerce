import mongoose from 'mongoose';

const dbCheck = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is not available. Please ensure MongoDB is running and your connection string is correct.'
    });
  }
  next();
};

export default dbCheck;
