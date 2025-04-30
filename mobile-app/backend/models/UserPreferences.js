const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  preferences: { type: Map, of: Number },  // key: spec name, value: tally
});

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
