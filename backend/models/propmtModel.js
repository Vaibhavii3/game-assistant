const mongoose = require('mongoose');

const gameContentSchema = new mongoose.Schema({
  prompt: { 
    type: String, 
    required: true,
    trim: true
  },
  
  response: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  
  type: { 
    type: String, 
    required: true,
    enum: ['character', 'quest', 'dialogue', 'enemy', 'item', 'world', 'story', 'general'],
    index: true
  },
  
  category: {
    type: String,
    default: 'general',
    index: true
  },
  
  // Additional metadata based on content type
  metadata: {
    // For characters
    characterClass: String,
    
    // For quests
    difficulty: String,
    questType: String,
    
    // For NPCs/dialogue
    npcRole: String,
    mood: String,
    
    // For enemies
    level: Number,
    enemyType: String,
    
    // For items
    itemType: String,
    rarity: String,
    
    // For world building
    locationType: String,
    atmosphere: String,
    
    // For story
    chapter: String,
    
    // Validation status
    validated: {
      type: Boolean,
      default: false
    }
  },
  
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  isFavorite: {
    type: Boolean,
    default: false
  },
  
  usageCount: {
    type: Number,
    default: 0
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

gameContentSchema.index({ type: 1, createdAt: -1 });
gameContentSchema.index({ category: 1, createdAt: -1 });
gameContentSchema.index({ isFavorite: 1, createdAt: -1 });

gameContentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

gameContentSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
});

gameContentSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  return this.save();
};

gameContentSchema.statics.getPopular = function(type, limit = 10) {
  const query = type ? { type } : {};
  return this.find(query)
    .sort({ usageCount: -1 })
    .limit(limit);
};

gameContentSchema.statics.getRecent = function(type, limit = 10) {
  const query = type ? { type } : {};
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

gameContentSchema.statics.getFavorites = function(type) {
  const query = { isFavorite: true };
  if (type) query.type = type;
  return this.find(query)
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('GameContent', gameContentSchema);