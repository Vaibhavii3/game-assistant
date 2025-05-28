const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  type: { type: String }, // Optional: game_idea, character, quest, etc.
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Prompt', promptSchema);
