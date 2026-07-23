const mongoose = require('mongoose');
const playerSchema = new mongoose.Schema({
  telegramId: { type: String, unique: true, index: true }, name: { type: String, default: 'MINERO' },
  geopoints: { type: Number, default: 0 }, geopointsEarned: { type: Number, default: 0 },
  geolite: { type: Number, default: 0 }, geoliteEarned: { type: Number, default: 0 }, energy: { type: Number, default: 100 },
  lastUpdated: { type: Number, default: () => Date.now() }, activeMine: { type: String, default: 'bronze' },
  mineHealth: { type: Number, default: 250 }, mineMaxHealth: { type: Number, default: 250 },
  referrer: { type: String, default: null }, referrals: { type: [String], default: [] }, referralCount: { type: Number, default: 0 },
  picks: { type: [{ id: String, expiresAt: Number, _id: false }], default: [] }, upgrades: { type: Map, of: Number, default: {} }
}, { versionKey: false });
module.exports = mongoose.models.Player || mongoose.model('Player', playerSchema);
