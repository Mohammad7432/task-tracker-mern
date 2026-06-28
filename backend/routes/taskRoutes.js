const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// @desc    Get all tasks (with filtering & sorting)
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Bonus Feature: Filtering
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;

    let apiQuery = Task.find(query);

    // Bonus Feature: Sorting (default to newest first)
    if (req.query.sortBy) {
      const sortParts = req.query.sortBy.split(':');
      apiQuery = apiQuery.sort({ [sortParts[0]]: sortParts[1] === 'desc' ? -1 : 1 });
    } else {
      apiQuery = apiQuery.sort({ createdAt: -1 });
    }

    const tasks = await apiQuery;
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a task
router.post('/', async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a task (FIXED: Uses req.params.id instead of req.id)
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
