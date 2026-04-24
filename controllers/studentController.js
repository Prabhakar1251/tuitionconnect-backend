const User = require('../models/User');

// GET /api/students
const getStudents = async (req, res) => {
  try {
    const { subject, city, class: cls, page = 1, limit = 12 } = req.query;

    const filter = { role: 'student', isApproved: true, isActive: true };
    if (subject) filter['studentProfile.subjects'] = { $in: [subject] };
    if (city)    filter.city = new RegExp(city, 'i');
    if (cls)     filter['studentProfile.class'] = cls;

    const students = await User.find(filter)
      .select('name city studentProfile createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    const unlockedIds = req.user?.unlockedContacts?.map(String) || [];
    const result = students.map(s => {
      const obj = s.toObject();
      if (!unlockedIds.includes(String(s._id))) obj.phone = null;
      return obj;
    });

    res.json({ students: result, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student', isApproved: true })
      .select('name city studentProfile createdAt');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const obj = student.toObject();
    const unlockedIds = req.user?.unlockedContacts?.map(String) || [];
    if (!unlockedIds.includes(String(student._id))) obj.phone = null;

    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStudents, getStudentById };
