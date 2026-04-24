const router = require('express').Router();
const { getPending, approveUser, rejectUser, getAllUsers, getAllPayments, getStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const adminOnly = [protect, authorize('admin')];

router.get('/stats',          ...adminOnly, getStats);
router.get('/pending',        ...adminOnly, getPending);
router.put('/approve/:id',    ...adminOnly, approveUser);
router.put('/reject/:id',     ...adminOnly, rejectUser);
router.get('/users',          ...adminOnly, getAllUsers);
router.get('/payments',       ...adminOnly, getAllPayments);

module.exports = router;
