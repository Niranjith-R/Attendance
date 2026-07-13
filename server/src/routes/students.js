import express from 'express';
import Student from '../models/Student.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { classId, search } = req.query;
    const filter = { isActive: true };

    if (classId) filter.classId = classId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter)
      .populate('classId', 'name section academicYear')
      .sort({ name: 1 });

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      'classId',
      'name section academicYear'
    );
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, rollNumber, email, classId } = req.body;

    if (!name || !rollNumber || !classId) {
      return res.status(400).json({ message: 'Name, roll number, and class are required' });
    }

    const existing = await Student.findOne({ rollNumber });
    if (existing) {
      return res.status(409).json({ message: 'Roll number already exists' });
    }

    const student = await Student.create({ name, rollNumber, email, classId });
    const populated = await student.populate('classId', 'name section academicYear');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, rollNumber, email, classId } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, rollNumber, email, classId },
      { new: true, runValidators: true }
    ).populate('classId', 'name section academicYear');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json({ message: 'Student deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
