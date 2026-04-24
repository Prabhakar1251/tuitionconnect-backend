const router = require('express').Router();
const { getStudents, getStudentById } = require('../controllers/studentController');
const { protect, requireApproved } = require('../middleware/auth');

router.get('/',    protect, requireApproved, getStudents);
router.get('/:id', protect, requireApproved, getStudentById);

module.exports = router;
