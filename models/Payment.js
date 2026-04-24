const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paidBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  unlockedUser:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Razorpay fields
  razorpayOrderId:   { type: String, required: true },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String },

  amount:   { type: Number, required: true },   // in paise
  currency: { type: String, default: 'INR' },
  status:   { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },

}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
