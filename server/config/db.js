import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
    try {
        // Fix for querySrv ETIMEOUT: Force DNS to Google's public DNS
        dns.setServers(['8.8.8.8', '8.8.4.4']);

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            family: 4, // Force IPv4 to avoid potential IPv6 DNS issues
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
