import express from 'express';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import Attendance from '../models/Attendance.js';

const router = express.Router();

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

router.get('/stats', async (_req, res) => {
  try {
    const today = new Date();
    const totalStudents = await Student.countDocuments({ isActive: true });
    const totalClasses = await Class.countDocuments();

    const todayRecords = await Attendance.find({
      date: { $gte: startOfDay(today), $lte: endOfDay(today) },
    });

    const todayPresent = todayRecords.filter((r) => r.status === 'present').length;
    const todayAbsent = todayRecords.filter((r) => r.status === 'absent').length;
    const todayLate = todayRecords.filter((r) => r.status === 'late').length;

    res.json({
      totalStudents,
      totalClasses,
      today: {
        marked: todayRecords.length,
        present: todayPresent,
        absent: todayAbsent,
        late: todayLate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/recent', async (_req, res) => {
  try {
    const recent = await Attendance.find()
      .populate('studentId', 'name rollNumber')
      .populate('classId', 'name section')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(recent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
