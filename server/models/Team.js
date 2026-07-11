const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  game: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,   // their role for this game, snapshotted at join time
    rank: String,
  }],
  region: String,
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);