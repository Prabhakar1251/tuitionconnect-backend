const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

/**
 * ✅ CORS Configuration (FIXED)
 */
const allowedOrigins = [
  'http://localhost:3000',
  'https://tuitionconnect.in'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps / Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed for this origin: ' + origin));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Handle preflight requests
app.options('*', cors());

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
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err.message);

  if (err.message.includes('CORS')) {
    return res.status(403).json({
      message: err.message
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Server error'
  });
});

/**
 * Server start
 */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
