import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB Atlas...');
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB Connection failed:', error.message);
        console.log('Check your network connection and ensure your IP is whitelisted in Atlas.');
    }
};

export default connectDB;
