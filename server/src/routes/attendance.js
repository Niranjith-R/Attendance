import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

const router = express.Router();

const startOfDay = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (dateStr) => {
  const date = new Date(dateStr);
  date.setHours(23, 59, 59, 999);
  return date;
};

router.get('/', async (req, res) => {
  try {
    const { classId, date, studentId, startDate, endDate } = req.query;
    const filter = {};

    if (classId) filter.classId = classId;
    if (studentId) filter.studentId = studentId;

    if (date) {
      filter.date = {
        $gte: startOfDay(date),
        $lte: endOfDay(date),
      };
    } else if (startDate && endDate) {
      filter.date = {
        $gte: startOfDay(startDate),
        $lte: endOfDay(endDate),
      };
    }

    const records = await Attendance.find(filter)
      .populate('studentId', 'name rollNumber')
      .populate('classId', 'name section academicYear')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/class/:classId/date/:date', async (req, res) => {
  try {
    const { classId, date } = req.params;

    const students = await Student.find({ classId, isActive: true }).sort({ name: 1 });
    const attendanceRecords = await Attendance.find({
      classId,
      date: { $gte: startOfDay(date), $lte: endOfDay(date) },
    });

    const attendanceMap = {};
    attendanceRecords.forEach((record) => {
      attendanceMap[record.studentId.toString()] = record;
    });

    const result = students.map((student) => ({
      student,
      attendance: attendanceMap[student._id.toString()] || null,
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const { classId, date, records } = req.body;

    if (!classId || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'classId, date, and records array are required' });
    }

    const attendanceDate = startOfDay(date);
    const operations = records.map(({ studentId, status, remarks }) =>
      Attendance.findOneAndUpdate(
        { studentId, date: attendanceDate },
        { studentId, classId, date: attendanceDate, status, remarks },
        { upsert: true, new: true, runValidators: true }
      )
    );

    const results = await Promise.all(operations);
    res.json({ message: 'Attendance saved successfully', count: results.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/report/:studentId', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = { studentId: req.params.studentId };

    if (startDate && endDate) {
      filter.date = {
        $gte: startOfDay(startDate),
        $lte: endOfDay(endDate),
      };
    }

    const records = await Attendance.find(filter).sort({ date: -1 });
    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      late: records.filter((r) => r.status === 'late').length,
    };

    if (summary.total > 0) {
      summary.attendancePercentage = Math.round(
        ((summary.present + summary.late) / summary.total) * 100
      );
    } else {
      summary.attendancePercentage = 0;
    }

    res.json({ records, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
