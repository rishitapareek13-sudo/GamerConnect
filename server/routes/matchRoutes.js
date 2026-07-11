const express = require('express');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');
const { calculateMatch } = require('../utils/matching');
const TeamRequest = require('../models/TeamRequest');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { game } = req.query;
    const me = await User.findById(req.userId);
    if (!me) return res.status(404).json({ message: 'User not found' });

    const gameFilter = game || me.games?.[0]?.name;
    if (!gameFilter) {
      return res.status(400).json({ message: 'No game specified and no game on your profile' });
    }

    const myGame = me.games.find((g) => g.name.toLowerCase() === gameFilter.toLowerCase());
    if (!myGame) {
      return res.status(400).json({ message: `You haven't set up a profile for ${gameFilter}` });
    }

    // Find other users who play the same game
    const candidates = await User.find({
      _id: { $ne: me._id },
      'games.name': { $regex: new RegExp(`^${gameFilter}$`, 'i') },
    }).select('-password');

    // Find any existing requests between me and these candidates
    const candidateIds = candidates.map((c) => c._id);
    const existingRequests = await TeamRequest.find({
      $or: [
        { from: me._id, to: { $in: candidateIds } },
        { from: { $in: candidateIds }, to: me._id },
      ],
    });

    const results = candidates.map((candidate) => {
      const theirGame = candidate.games.find((g) => g.name.toLowerCase() === gameFilter.toLowerCase());
      const match = calculateMatch(myGame, theirGame, me.region, candidate.region, me.availability, candidate.availability);

      const existing = existingRequests.find(
        (r) =>
          (r.from.toString() === me._id.toString() && r.to.toString() === candidate._id.toString()) ||
          (r.to.toString() === me._id.toString() && r.from.toString() === candidate._id.toString())
      );

      return {
        id: candidate._id,
        username: candidate.username,
        avatar: candidate.avatar,
        game: theirGame,
        region: candidate.region,
        availability: candidate.availability,
        reputation: candidate.reputation,
        matchPercent: match.percent,
        breakdown: match.breakdown,
        requestStatus: existing ? existing.status : null,
      };
    });

    // Highest match first
    results.sort((a, b) => b.matchPercent - a.matchPercent);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;