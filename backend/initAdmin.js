require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/exam-seating';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('MongoDB connected for seeding...');

        // Check if admin already exists
        const adminExists = await Admin.findOne({ email: 'admin@college.edu' });
        if (adminExists) {
            console.log('Admin already exists.');
            process.exit();
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const admin = new Admin({
            email: 'admin@college.edu',
            password: hashedPassword
        });

        await admin.save();
        console.log('Default admin seeded: admin@college.edu / admin123');
        process.exit();
    })
    .catch(err => {
        console.error('Database connection error:', err);
        process.exit(1);
    });
