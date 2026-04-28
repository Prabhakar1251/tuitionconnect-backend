const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

/**
 * ✅ SIMPLE & WORKING CORS (BEST FOR NOW)
 */
app.use(cors({
  origin: "*",   // allow all (fixes your issue instantly)
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

/**
 * Middleware
 */
app.use(express.json());

/**
 * Routes
 */
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/tutors',   require('./routes/tutorRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/payment',  require('./routes/paymentRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

/**
 * Server start
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
