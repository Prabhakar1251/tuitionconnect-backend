const User = require('../models/User');

// GET /api/tutors  — list all approved tutors (contact info hidden unless unlocked)
const getTutors = async (req, res) => {
  try {
    const { subject, city, minExp, maxFee, page = 1, limit = 12 } = req.query;

    const filter = { role: 'tutor', isApproved: true, isActive: true };
    if (subject) filter['tutorProfile.subjects'] = { $in: [subject] };
    if (city)    filter.city = new RegExp(city, 'i');
    if (minExp)  filter['tutorProfile.experience'] = { $gte: Number(minExp) };
    if (maxFee)  filter['tutorProfile.feePerHour'] = { $lte: Number(maxFee) };

    const tutors = await User.find(filter)
      .select('name city tutorProfile createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    // Hide phone for contacts not yet unlocked by the requesting user
    const unlockedIds = req.user?.unlockedContacts?.map(String) || [];
    const result = tutors.map(t => {
      const obj = t.toObject();
      if (!unlockedIds.includes(String(t._id))) {
        obj.phone = null;   // hidden until paid
      }
      return obj;
    });

    res.json({ tutors: result, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/tutors/:id
const getTutorById = async (req, res) => {
  try {
    const tutor = await User.findOne({ _id: req.params.id, role: 'tutor', isApproved: true })
      .select('name city tutorProfile createdAt');
    if (!tutor) return res.status(404).json({ message: 'Tutor not found' });

    const obj = tutor.toObject();
    const unlockedIds = req.user?.unlockedContacts?.map(String) || [];
    if (!unlockedIds.includes(String(tutor._id))) obj.phone = null;

    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTutors, getTutorById };
