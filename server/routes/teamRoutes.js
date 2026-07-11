const express = require('express');
const Team = require('../models/Team');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');
const { calculateMatch } = require('../utils/matching');
const { detectGaps } = require('../utils/teamGaps');

const router = express.Router();

// Create a team (starts with just you as the first member)
router.post('/', protect, async (req, res) => {
  try {
    const { name, game, region } = req.body;
    const me = await User.findById(req.userId);
    const myGame = me.games.find((g) => g.name.toLowerCase() === game.toLowerCase());

    if (!myGame) {
      return res.status(400).json({ message: `Set up your profile for ${game} first` });
    }

    const team = await Team.create({
      name,
      game,
      owner: req.userId,
      region: region || me.region,
      members: [{ user: req.userId, role: myGame.role, rank: myGame.rank }],
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my teams
router.get('/my-teams', protect, async (req, res) => {
  try {
    const teams = await Team.find({ 'members.user': req.userId })
      .populate('members.user', 'username avatar');
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get gap analysis + suggested players for a specific team
router.get('/:id/gaps', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const { roleCounts, needed } = detectGaps(team.members);

    // Find candidates who play this game and fill a needed role
    const memberIds = team.members.map((m) => m.user);
    const candidates = await User.find({
      _id: { $nin: memberIds },
      'games.name': { $regex: new RegExp(`^${team.game}$`, 'i') },
      'games.role': { $in: needed },
    });

    const me = await User.findById(req.userId);
    const myGame = me.games.find((g) => g.name.toLowerCase() === team.game.toLowerCase());

    const suggestions = candidates.map((candidate) => {
      const theirGame = candidate.games.find(
        (g) => g.name.toLowerCase() === team.game.toLowerCase() && needed.includes(g.role)
      );
      const match = calculateMatch(myGame, theirGame, team.region, candidate.region, me.availability, candidate.availability);

      return {
        id: candidate._id,
        username: candidate.username,
        game: theirGame,
        region: candidate.region,
        matchPercent: match.percent,
      };
    });

    suggestions.sort((a, b) => b.matchPercent - a.matchPercent);

    res.json({ roleCounts, needed, suggestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add an accepted teammate to a team
router.post('/:id/add-member', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found' });

    if (team.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the team owner can add members' });
    }

    const alreadyIn = team.members.some((m) => m.user.toString() === userId);
    if (alreadyIn) return res.status(400).json({ message: 'Already a member' });

    const user = await User.findById(userId);
    const theirGame = user.games.find((g) => g.name.toLowerCase() === team.game.toLowerCase());
    if (!theirGame) return res.status(400).json({ message: `User has no profile for ${team.game}` });

    team.members.push({ user: userId, role: theirGame.role, rank: theirGame.rank });
    await team.save();

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;