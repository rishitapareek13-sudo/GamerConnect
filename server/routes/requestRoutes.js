const express = require('express');
const TeamRequest = require('../models/TeamRequest');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Send a request to another player
router.post('/', protect, async (req, res) => {
  try {
    const { to, game } = req.body;

    if (to === req.userId) {
      return res.status(400).json({ message: "You can't send a request to yourself" });
    }

    const existing = await TeamRequest.findOne({
      from: req.userId,
      to,
      game,
      status: 'pending',
    });
    if (existing) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const request = await TeamRequest.create({ from: req.userId, to, game });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get requests sent TO me (incoming)
router.get('/incoming', protect, async (req, res) => {
  try {
    const requests = await TeamRequest.find({ to: req.userId, status: 'pending' })
      .populate('from', 'username avatar games region');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get requests I sent (outgoing)
router.get('/outgoing', protect, async (req, res) => {
  try {
    const requests = await TeamRequest.find({ from: req.userId })
      .populate('to', 'username avatar games region');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept or reject a request
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await TeamRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Only the recipient can accept/reject
    if (request.to.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;