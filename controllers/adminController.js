const User    = require('../models/User');
const Payment = require('../models/Payment');

// GET /api/admin/pending  — users awaiting approval
const getPending = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false, role: { $ne: 'admin' } })
      .select('name email role city createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/admin/approve/:id
const approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, { isApproved: true }, { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `${user.name} approved`, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/admin/reject/:id  (soft-delete)
const rejectUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `${user.name} rejected`, user });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/users  — all users with filters
const getAllUsers = async (req, res) => {
  try {
    const { role, city, page = 1, limit = 20 } = req.query;
    const filter = { role: { $ne: 'admin' } };
    if (role) filter.role = role;
    if (city) filter.city = new RegExp(city, 'i');

    const users = await User.find(filter)
      .select('name email role city isApproved isActive createdAt')
      .skip((page - 1) * limit).limit(Number(limit))
      .sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    res.json({ users, total });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/payments  — all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('paidBy', 'name role')
      .populate('unlockedUser', 'name role')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/admin/stats  — dashboard numbers
const getStats = async (req, res) => {
  try {
    const [tutors, students, pending, payments] = await Promise.all([
      User.countDocuments({ role: 'tutor', isApproved: true }),
      User.countDocuments({ role: 'student', isApproved: true }),
      User.countDocuments({ isApproved: false, role: { $ne: 'admin' } }),
      Payment.find({ status: 'paid' }).select('amount'),
    ]);
    const revenue = payments.reduce((sum, p) => sum + p.amount, 0) / 100; // convert paise to ₹
    res.json({ tutors, students, pending, revenue });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getPending, approveUser, rejectUser, getAllUsers, getAllPayments, getStats };
