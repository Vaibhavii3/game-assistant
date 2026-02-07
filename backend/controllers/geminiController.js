const { callGemini, validateGameContent, generateImage, generateImageFromImage } = require('../services/geminiService');
const GameContent = require('../models/propmtModel');

exports.handlePrompt = async (req, res) => {
  const { prompt, type } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await callGemini(prompt, type || 'text');
    
    const saved = await GameContent.create({ 
      prompt, 
      response: typeof response === 'object' ? response : { text: response },
      type: type || 'general',
      category: 'custom'
    });

    res.json({ 
      success: true,
      response, 
      savedId: saved._id,
      type: type || 'general'
    });
  } catch (error) {
    console.error('Prompt handler error:', error);
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message 
    });
  }
};

// Character generation with validation
exports.createCharacter = async (req, res) => {
  const { prompt, characterType } = req.body;
  const defaultPrompt = characterType 
    ? `Create a ${characterType} character for my game`
    : "Create a unique hero with special powers, detailed backstory, and interesting personality";
  
  const userPrompt = prompt || defaultPrompt;

  try {
    const character = await callGemini(userPrompt, 'character');
    
    // Validate character has required fields
    const validation = validateGameContent(character, 'character');
    
    const saved = await GameContent.create({ 
      prompt: userPrompt, 
      response: character,
      type: 'character',
      category: 'character',
      metadata: {
        characterClass: character.class,
        validated: validation.isValid
      }
    });

    res.json({ 
      success: true,
      character,
      validation,
      savedId: saved._id 
    });
  } catch (err) {
    console.error('Character creation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate character',
      details: err.message 
    });
  }
};

// Quest generation
exports.generateQuest = async (req, res) => {
  const { prompt, difficulty, questType } = req.body;
  
  let questPrompt = prompt;
  if (!questPrompt) {
    questPrompt = `Create a ${difficulty || 'medium'} difficulty ${questType || 'adventure'} quest`;
  }

  try {
    const quest = await callGemini(questPrompt, 'quest');
    
    const validation = validateGameContent(quest, 'quest');
    
    const saved = await GameContent.create({ 
      prompt: questPrompt, 
      response: quest,
      type: 'quest',
      category: 'quest',
      metadata: {
        difficulty: quest.difficulty,
        questType: quest.type,
        validated: validation.isValid
      }
    });

    res.json({ 
      success: true,
      quest,
      validation,
      savedId: saved._id 
    });
  } catch (err) {
    console.error('Quest generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate quest',
      details: err.message 
    });
  }
};

// Dialogue generation
exports.generateDialogue = async (req, res) => {
  const { prompt, npcType, mood } = req.body;
  
  let dialoguePrompt = prompt;
  if (!dialoguePrompt) {
    dialoguePrompt = `Create dialogue for a ${npcType || 'merchant'} NPC who is ${mood || 'friendly'}`;
  }

  try {
    const dialogue = await callGemini(dialoguePrompt, 'dialogue');
    
    const validation = validateGameContent(dialogue, 'dialogue');
    
    const saved = await GameContent.create({ 
      prompt: dialoguePrompt, 
      response: dialogue,
      type: 'dialogue',
      category: 'dialogue',
      metadata: {
        npcRole: dialogue.npcRole,
        mood: dialogue.mood,
        validated: validation.isValid
      }
    });

    res.json({ 
      success: true,
      dialogue,
      validation,
      savedId: saved._id 
    });
  } catch (err) {
    console.error('Dialogue generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate dialogue',
      details: err.message 
    });
  }
};

// World/Location building
exports.generateWorld = async (req, res) => {
  const { prompt, locationType } = req.body;
  
  const worldPrompt = prompt || `Create a detailed ${locationType || 'fantasy'} game world`;

  try {
    const world = await callGemini(worldPrompt, 'worldBuilding');
    
    const saved = await GameContent.create({ 
      prompt: worldPrompt, 
      response: world,
      type: 'world',
      category: 'worldBuilding',
      metadata: {
        locationType: world.type,
        atmosphere: world.atmosphere
      }
    });

    res.json({ 
      success: true,
      world,
      savedId: saved._id 
    });
  } catch (err) {
    console.error('World generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate world',
      details: err.message 
    });
  }
};

// Enemy/Monster generation
exports.generateEnemy = async (req, res) => {
  const { prompt, level, enemyType } = req.body;
  
  let enemyPrompt = prompt;
  if (!enemyPrompt) {
    enemyPrompt = `Create a level ${level || 10} ${enemyType || 'creature'} enemy`;
  }

  try {
    const enemy = await callGemini(enemyPrompt, 'enemy');
    
    const validation = validateGameContent(enemy, 'enemy');
    
    const saved = await GameContent.create({ 
      prompt: enemyPrompt, 
      response: enemy,
      type: 'enemy',
      category: 'enemy',
      metadata: {
        level: enemy.level,
        enemyType: enemy.type,
        validated: validation.isValid
      }
    });

    res.json({ 
      success: true,
      enemy,
      validation,
      savedId: saved._id 
    });
  } catch (err) {
    console.error('Enemy generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate enemy',
      details: err.message 
    });
  }
};

// Item/Equipment generation
exports.generateItem = async (req, res) => {
  const { prompt, itemType, rarity } = req.body;
  
  let itemPrompt = prompt;
  if (!itemPrompt) {
    itemPrompt = `Create a ${rarity || 'rare'} ${itemType || 'weapon'} item`;
  }

  try {
    const item = await callGemini(itemPrompt, 'item');
    
    const validation = validateGameContent(item, 'item');
    
    const saved = await GameContent.create({ 
      prompt: itemPrompt, 
      response: item,
      type: 'item',
      category: 'item',
      metadata: {
        itemType: item.type,
        rarity: item.rarity,
        validated: validation.isValid
      }
    });

    res.json({ 
      success: true,
      item,
      validation,
      savedId: saved._id 
    });
  } catch (err) {
    console.error('Item generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate item',
      details: err.message 
    });
  }
};

// Story beat generation
exports.generateStory = async (req, res) => {
  const { prompt, chapter } = req.body;
  
  const storyPrompt = prompt || `Create an engaging story moment for ${chapter || 'the beginning'} of my game`;

  try {
    const story = await callGemini(storyPrompt, 'storyBeat');
    
    const saved = await GameContent.create({ 
      prompt: storyPrompt, 
      response: story,
      type: 'story',
      category: 'narrative',
      metadata: {
        chapter: story.chapter,
        mood: story.mood
      }
    });

    res.json({ 
      success: true,
      story,
      savedId: saved._id 
    });
  } catch (err) {
    console.error('Story generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate story',
      details: err.message 
    });
  }
};

// Get all saved content with filters
exports.getSavedContent = async (req, res) => {
  try {
    const { type, category, limit = 20 } = req.query;
    
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;

    const content = await GameContent.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ 
      success: true,
      count: content.length,
      content 
    });
  } catch (err) {
    console.error('Get content error:', err);
    res.status(500).json({ 
      error: 'Failed to retrieve content',
      details: err.message 
    });
  }
};

// Get content by ID
exports.getContentById = async (req, res) => {
  try {
    const content = await GameContent.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ 
      success: true,
      content 
    });
  } catch (err) {
    console.error('Get content by ID error:', err);
    res.status(500).json({ 
      error: 'Failed to retrieve content',
      details: err.message 
    });
  }
};

// Delete content
exports.deleteContent = async (req, res) => {
  try {
    const content = await GameContent.findByIdAndDelete(req.params.id);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ 
      success: true,
      message: 'Content deleted successfully' 
    });
  } catch (err) {
    console.error('Delete content error:', err);
    res.status(500).json({ 
      error: 'Failed to delete content',
      details: err.message 
    });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await GameContent.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await GameContent.countDocuments();

    res.json({ 
      success: true,
      total,
      byCategory: stats 
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      details: err.message 
    });
  }
};

exports.generateImageFromText = async (req, res) => {
  const { prompt, width, height, model, seed } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const imageData = await generateImage(prompt, {
      width: width || 1024,
      height: height || 1024,
      model: model || 'flux',
      seed: seed || Math.floor(Math.random() * 1000000),
      nologo: true,
      enhance: true
    });

    const saved = await GameContent.create({
      prompt,
      response: imageData,
      type: 'image',
      category: 'image',
      metadata: {
        imageModel: imageData.model,
        dimensions: `${imageData.width}x${imageData.height}`,
        seed: imageData.seed,
        validated: true
      }
    });

    res.json({
      success: true,
      imageUrl: imageData.imageUrl,
      imageData,
      savedId: saved._id
    });
  } catch (err) {
    console.error('Image generation error:', err);
    res.status(500).json({
      error: 'Failed to generate image',
      details: err.message
    });
  }
};

// NEW: Image-to-Image generation
exports.generateImageFromImageInput = async (req, res) => {
  const { prompt, sourceImageUrl, width, height, model, seed } = req.body;

  if (!prompt || !sourceImageUrl) {
    return res.status(400).json({ error: 'Prompt and source image URL are required' });
  }

  try {
    const imageData = await generateImageFromImage(sourceImageUrl, prompt, {
      width: width || 1024,
      height: height || 1024,
      model: model || 'flux',
      seed: seed || Math.floor(Math.random() * 1000000),
      nologo: true,
      enhance: true
    });

    const saved = await GameContent.create({
      prompt: `${prompt} (from source image)`,
      response: imageData,
      type: 'image',
      category: 'image-to-image',
      metadata: {
        imageModel: imageData.model,
        dimensions: `${imageData.width}x${imageData.height}`,
        seed: imageData.seed,
        sourceImage: sourceImageUrl,
        validated: true
      }
    });

    res.json({
      success: true,
      imageUrl: imageData.imageUrl,
      imageData,
      savedId: saved._id
    });
  } catch (err) {
    console.error('Image-to-image error:', err);
    res.status(500).json({
      error: 'Failed to generate image from image',
      details: err.message
    });
  }
};

