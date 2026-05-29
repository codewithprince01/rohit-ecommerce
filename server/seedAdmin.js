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
        let adminUser = await User.findOne({ email: 'rohit@gmail.com' });
        
        if (adminUser) {
            console.log('⚠️  Admin user already exists!');
            
            // Force update password if needed
            adminUser.password = 'Rohit@1234';
            adminUser.role = 'admin';
            await adminUser.save();
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 Email: rohit@gmail.com');
            console.log('🔑 Password: Rohit@1234');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            await mongoose.connection.close();
            process.exit(0);
        }

        // Create admin user
        adminUser = await User.create({
            name: 'Rohit Admin',
            email: 'rohit@gmail.com',
            password: 'Rohit@1234',
            phone: '9999999999',
            role: 'admin',
            isActive: true,
            isVerified: true
        });

        console.log('✅ Admin user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: rohit@gmail.com');
        console.log('🔑 Password: Rohit@1234');
        console.log('👤 Role: admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🚀 You can now login at: http://localhost:5173/admin/login');
        
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        await mongoose.connection.close();
        process.exit(1);
    }
};

createAdminUser();
