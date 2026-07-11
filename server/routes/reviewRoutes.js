const express = require('express');
const Review = require('../models/Review');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Leave a review for another player
router.post('/', protect, async (req, res) => {
  try {
    const { to, rating, comment } = req.body;

    if (to === req.userId) {
      return res.status(400).json({ message: "You can't review yourself" });
    }

    const review = await Review.create({ from: req.userId, to, rating, comment });

    // Recalculate that user's average reputation
    const allReviews = await Review.find({ to });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await User.findByIdAndUpdate(to, {
      reputation: Math.round(avg * 10) / 10, // one decimal place
      reviewCount: allReviews.length,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all reviews received by a player
router.get('/:userId', protect, async (req, res) => {
  try {
    const reviews = await Review.find({ to: req.params.userId })
      .populate('from', 'username')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;