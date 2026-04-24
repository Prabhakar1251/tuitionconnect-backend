const router = require('express').Router();
const { createOrder, verifyPayment, getMyPayments } = require('../controllers/paymentController');
const { protect, requireApproved } = require('../middleware/auth');

router.post('/create-order', protect, requireApproved, createOrder);
router.post('/verify',       protect, requireApproved, verifyPayment);
router.get('/my-history',    protect, getMyPayments);

module.exports = router;
