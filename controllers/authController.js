const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, city, tutorProfile, studentProfile } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    if (!['tutor', 'student'].includes(role))
      return res.status(400).json({ message: 'Role must be tutor or student' });

    const user = await User.create({
      name, email, password, phone, role, city,
      tutorProfile:   role === 'tutor'   ? tutorProfile   : undefined,
      studentProfile: role === 'student' ? studentProfile : undefined,
      isApproved: false,  // admin must approve
    });

    res.status(201).json({
      message: 'Registration successful! Awaiting admin approval.',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isApproved && role !== 'admin')
      return res.status(403).json({ message: 'Account pending admin approval' });

    res.json({ token: generateToken(user._id), user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me  (requires protect middleware)
const getMe = async (req, res) => {
  res.json(req.user);
};

// PUT /api/auth/profile  — update own profile
const updateProfile = async (req, res) => {
  try {
    const { tutorProfile, studentProfile, phone, city } = req.body;
    const update = { phone, city };
    if (req.user.role === 'tutor')   update.tutorProfile   = tutorProfile;
    if (req.user.role === 'student') update.studentProfile = studentProfile;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
