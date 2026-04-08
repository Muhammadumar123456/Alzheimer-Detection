/**
 * =============================================================================
 * ADMIN SEEDER
 * =============================================================================
 * Creates a default admin user if one doesn't exist.
 * Run: node src/seedAdmin.js
 * =============================================================================
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('./modules/auth/user.model');

const ADMIN_DATA = {
    name: 'Admin',
    email: 'admin@alzdetect.com',
    passwordHash: 'Admin@123456',
    role: 'admin',
    authProvider: 'local',
};

const seedAdmin = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.error('❌ MONGODB_URI not found in .env');
            process.exit(1);
        }

        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log(`ℹ️  Admin already exists: ${existingAdmin.email}`);
            console.log('   No changes made.');
            await mongoose.disconnect();
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create(ADMIN_DATA);
        console.log('✅ Default admin user created successfully!');
        console.log('   ──────────────────────────────────');
        console.log(`   📧 Email:    ${ADMIN_DATA.email}`);
        console.log(`   🔑 Password: Admin@123456`);
        console.log(`   👤 Role:     admin`);
        console.log('   ──────────────────────────────────');
        console.log('   ⚠️  IMPORTANT: Change the password after first login!');

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeder failed:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }
};

seedAdmin();
