// Seed script to create an admin user (ESM)
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Import the existing User model
import User from './models/User.js';
import connectDB from './config/db.js';

const createAdminUser = async () => {
    try {
        await connectDB();
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@grocery.com' });
        
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 Email: admin@grocery.com');
            console.log('🔑 Password: Admin@123');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            await mongoose.connection.close();
            process.exit(0);
        }

        // Create admin user
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@grocery.com',
            password: 'Admin@123',
            phone: '9999999999',
            role: 'admin',
            isActive: true,
            isVerified: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: admin@grocery.com');
        console.log('🔑 Password: Admin@123');
        console.log('👤 Role: admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🚀 You can now login at: http://localhost:5173/login');
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

createAdminUser();
