const Razorpay = require('razorpay');
const crypto  = require('crypto');
const Payment = require('../models/Payment');
const User    = require('../models/User');

const getRazorpay = () => {
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const createOrder = async (req, res) => {
  try {
    console.log('createOrder called by user:', req.user._id);
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
    const { targetUserId } = req.body;
    console.log('targetUserId:', targetUserId);
    if (String(req.user._id) === String(targetUserId))
      return res.status(400).json({ message: 'Cannot unlock your own profile' });
    if (req.user.unlockedContacts.map(String).includes(String(targetUserId)))
      return res.status(400).json({ message: 'Contact already unlocked' });
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    const amount = Number(process.env.UNLOCK_PRICE) || 5000;
    console.log('Creating Razorpay order for amount:', amount);
    const order = await getRazorpay().orders.create({
      amount,
      currency: 'INR',
      receipt:  `unlock_${Date.now()}`,
      notes:    { paidBy: String(req.user._id), unlockedUser: String(targetUserId) },
    });
    console.log('Razorpay order created:', order.id);
    await Payment.create({
      paidBy:           req.user._id,
      unlockedUser:     targetUserId,
      razorpayOrderId:  order.id,
      amount,
      status:           'created',
    });
    res.json({
      orderId:  order.id,
      amount,
      currency: 'INR',
      keyId:    process.env.RAZORPAY_KEY_ID,
      name:     targetUser.name,
    });
  } catch (err) {
    console.error('createOrder ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    if (expectedSig !== razorpaySignature)
      return res.status(400).json({ message: 'Payment verification failed — invalid signature' });
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { razorpayPaymentId, razorpaySignature, status: 'paid' },
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: 'Payment record not found' });
    await User.findByIdAndUpdate(payment.paidBy, {
      $addToSet: { unlockedContacts: payment.unlockedUser },
    });
    const unlockedUser = await User.findById(payment.unlockedUser).select('name phone');
    res.json({ message: 'Payment verified! Contact unlocked.', unlockedUser });
  } catch (err) {
    console.error('verifyPayment ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ paidBy: req.user._id })
      .populate('unlockedUser', 'name role city')
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    console.error('getMyPayments ERROR:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, verifyPayment, getMyPayments };