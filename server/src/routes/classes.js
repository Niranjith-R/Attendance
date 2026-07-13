import express from 'express';
import Class from '../models/Class.js';
import Student from '../models/Student.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const classes = await Class.find().sort({ name: 1, section: 1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const studentCount = await Student.countDocuments({
      classId: classDoc._id,
      isActive: true,
    });

    res.json({ ...classDoc.toObject(), studentCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, section, academicYear } = req.body;

    if (!name || !section || !academicYear) {
      return res.status(400).json({ message: 'Name, section, and academic year are required' });
    }

    const classDoc = await Class.create({ name, section, academicYear });
    res.status(201).json(classDoc);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Class with this name, section, and year already exists' });
    }
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, section, academicYear } = req.body;

    const classDoc = await Class.findByIdAndUpdate(
      req.params.id,
      { name, section, academicYear },
      { new: true, runValidators: true }
    );

    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(classDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const studentCount = await Student.countDocuments({
      classId: req.params.id,
      isActive: true,
    });

    if (studentCount > 0) {
      return res.status(400).json({
        message: `Cannot delete class with ${studentCount} active student(s). Deactivate students first.`,
      });
    }

    const classDoc = await Class.findByIdAndDelete(req.params.id);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
