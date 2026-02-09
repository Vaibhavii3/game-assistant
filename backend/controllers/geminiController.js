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

exports.generateImageFromImageInput = async (req, res) => {
  try {
    const { prompt, sourceImage, width, height, model, strength, artStyle, seed, assetType } = req.body;

    // Validation
    // if (!prompt) {
    //   return res.status(400).json({ 
    //     error: 'Prompt is required',
    //     example: 'Convert this sketch into a fantasy warrior character'
    //   });
    // }

    if (!sourceImage) {
      return res.status(400).json({ 
        error: 'Source image is required (base64 format)',
        example: 'Upload an image file to transform it into professional game art'
      });
    }

    console.log('🎨 Starting image-to-image conversion...');
    console.log('📸 Source Image:', sourceImage ? 'Uploaded ✅' : 'Missing ❌');
    console.log('Asset Type:', assetType || 'general');
    console.log('Art Style:', artStyle || '2d');
    console.log('💬 Custom Prompt:', prompt || 'Auto-generated based on selections');

    // Generate enhanced prompt based on asset type
    let enhancedPrompt = prompt;

    if (prompt && prompt.trim()) {
      // User provided custom prompt - use it as base
      enhancedPrompt = prompt;
      console.log('✍️ Using custom prompt');
    } else {
      // Auto-generate prompt based on selections
      console.log('🤖 Auto-generating prompt from options...');


      const assetDescriptions = {
        'character': 'professional game character with detailed design',
        'scene': 'detailed game environment background with atmospheric lighting',
        'item': 'polished game item with clean design',
        'enemy': 'menacing game enemy with intimidating appearance',
        'ui': 'clean game UI element with polished design'
      };
      
      const styleDescriptions = {
        '2d': '2D game art style, hand-painted, vibrant colors',
        '3d': '3D rendered style, realistic lighting, detailed textures',
        'anime': 'anime game art style, cel-shaded, clean linework',
        'pixel': 'pixel art style, retro gaming aesthetic',
        'realistic': 'photorealistic game graphics, high detail'
      };
    
    const assetDesc = assetDescriptions[assetType] || 'professional game asset';
      const styleDesc = styleDescriptions[artStyle] || '2D game art style';
      
      enhancedPrompt = `Transform this into ${assetDesc}, ${styleDesc}, high quality, game-ready`;
    }

    // ✅ Add asset-specific enhancements
    if (assetType) {
      const assetEnhancers = {
        'character': 'detailed character design, full body view, professional quality',
        'scene': 'immersive environment, atmospheric details, game background',
        'item': 'clean composition, detailed asset, UI-ready icon',
        'enemy': 'creature concept art, menacing design, game-ready enemy',
        'ui': 'polished interface element, clean layout, professional UI'
      };
      
      const enhancer = assetEnhancers[assetType] || 'professional game asset';
      enhancedPrompt = `${enhancedPrompt}, ${enhancer}`;
    }

    console.log('📝 Final Enhanced Prompt:', enhancedPrompt);

    // Call the image-to-image service
    const imageData = await generateImageFromImage(sourceImage, enhancedPrompt, {
      width: width || 1024,
      height: height || 1024,
      model: model || 'img2img',
      strength: strength || 0.75,
      artStyle: artStyle || '2d',
      seed: seed || Math.floor(Math.random() * 1000000)
    });

    // Save to database
    const saved = await GameContent.create({
      prompt: enhancedPrompt,
      response: imageData,
      type: 'image-to-image',
      category: assetType || 'image-conversion',
      metadata: {
        imageModel: imageData.model,
        dimensions: `${imageData.width}x${imageData.height}`,
        seed: imageData.seed,
        artStyle: imageData.artStyle,
        strength: imageData.strength,
        transformationType: 'sketch-to-art',
        hasCustomPrompt: !!(prompt && prompt.trim()),
        autoGenerated: !(prompt && prompt.trim()),
        validated: true
      }
    });

    console.log('✅ Transformation successful!');

    res.json({
      success: true,
      message: 'Image transformed successfully!',
      imageUrl: imageData.imageUrl,
      imageData: {
        ...imageData,
        savedId: saved._id,
        enhancedPrompt: enhancedPrompt,
        usedAutoPrompt: !(prompt && prompt.trim())
      }
    });

  } catch (err) {
    console.error('❌ Image-to-image error:', err);
    res.status(500).json({
      error: 'Failed to transform image',
      details: err.message,
      suggestion: 'Try adjusting the strength (0.5-0.9) or use a different art style'
    });
  }
};