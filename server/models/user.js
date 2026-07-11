const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  games: [{
    name: String,       // e.g. "Valorant"
    rank: String,       // e.g. "Gold 2"
    role: String,       // e.g. "Duelist"
  }],
  region: String,
  availability: String,
  reputation: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  matchesPlayed: { type: Number, default: 0 },
  matchesWon: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);