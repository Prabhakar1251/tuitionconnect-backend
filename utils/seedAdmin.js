// Run once to create the admin account:  node utils/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ role: 'admin' });
  if (existing) {
    console.log('Admin already exists:', existing.email);
    process.exit(0);
  }
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@tuitionconnect.com',
    password: 'Admin@1234',   // will be hashed by pre-save hook
    phone: '9999999999',
    role: 'admin',
    city: 'Tirupati',
    isApproved: true,
    isActive: true,
  });
  console.log('Admin created:', admin.email, '/ password: Admin@1234');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
