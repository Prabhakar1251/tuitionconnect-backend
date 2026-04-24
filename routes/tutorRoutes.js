const router = require('express').Router();
const { getTutors, getTutorById } = require('../controllers/tutorController');
const { protect, requireApproved } = require('../middleware/auth');

router.get('/',    protect, requireApproved, getTutors);
router.get('/:id', protect, requireApproved, getTutorById);

module.exports = router;
