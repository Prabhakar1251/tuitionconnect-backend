const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8 },
  phone:    { type: String, required: true },
  role:     { type: String, enum: ['tutor', 'student', 'admin'], required: true },
  city:     { type: String, required: true },
  isApproved: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },

  // Tutor-specific
  tutorProfile: {
    subjects:    [String],
    experience:  Number,          // years
    qualification: String,
    feePerHour:  Number,          // in ₹
    bio:         String,
    teachingMode: { type: String, enum: ['online', 'offline', 'both'], default: 'both' },
  },

  // Student-specific
  studentProfile: {
    class:       String,          // e.g. "Class 10"
    board:       String,          // e.g. "CBSE", "ICSE", "AP State"
    subjects:    [String],        // subjects needed
    requirement: String,          // description
    budget:      Number,          // max fee willing to pay
  },

  // Unlocked contacts — array of user IDs this user has paid to see
  unlockedContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password helper
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

// Never send password in responses
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
