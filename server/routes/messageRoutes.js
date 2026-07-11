const express = require('express');
const Message = require('../models/Message');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:teamId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ team: req.params.teamId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;