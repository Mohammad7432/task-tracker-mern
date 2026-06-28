const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// ==========================================
// DATABASE IN-FILE COLLECTIONS SCHEMATICS
// ==========================================
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  }
}, { timestamps: true });

// Prevent compiling errors if models reinitialize during live hot-reloads
const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

// ==========================================
// REST OPERATIONS ROUTING MANAGEMENT
// ==========================================

// @desc    Get all tasks (Handles filtering and sorting)
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    // Forces newly logged tasks directly up to the top of your layout dashboard
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new task record
router.post('/', async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    return res.status(201).json(newTask);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// @desc    Update a task entry (FIXED PARAMS COMPLIANCE TARGET)
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task record target could not be found.' });
    }
    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a task entry completely from Atlas
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task record target could not be found.' });
    }
    return res.status(200).json({ message: 'Task cleared from dataset.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
