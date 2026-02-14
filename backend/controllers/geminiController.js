const { callGemini, validateGameContent, generateImage, generateImageFromImage } = require('../services/geminiService');
const GameContent = require('../models/propmtModel');

// ============================================
// IMPROVED ERROR HANDLER
// ============================================
const handleError = (err, res, context) => {
  console.error(`❌ ${context} error:`, err);
  console.error('Error stack:', err.stack);
  
  let errorMessage = err.message || 'Unknown error occurred';
  let tip = 'Try again in a moment';
  let statusCode = 500;
  
  // Rate limit errors
  if (errorMessage.includes('rate') || errorMessage.includes('429')) {
    errorMessage = 'Rate limit exceeded';
    tip = 'Please wait 5-10 minutes before trying again. Free tier has limited requests.';
    statusCode = 429;
  }
  // Timeout errors
  else if (errorMessage.includes('timeout')) {
    errorMessage = 'Request timed out';
    tip = 'The API took too long. Try again with a simpler prompt or wait a moment.';
    statusCode = 504;
  }
  // All models failed
  else if (errorMessage.includes('All models failed')) {
    errorMessage = 'All AI models are currently unavailable';
    tip = 'Hugging Face free tier may be experiencing high traffic. Try again in 10-15 minutes.';
    statusCode = 503;
  }
  // Model loading errors
  else if (errorMessage.includes('loading') || errorMessage.includes('503')) {
    errorMessage = 'Model is loading';
    tip = 'The AI model is starting up (cold start). Please wait 30-60 seconds and try again.';
    statusCode = 503;
  }
  // API key errors
  else if (errorMessage.includes('API') && errorMessage.includes('key')) {
    errorMessage = 'API configuration error';
    tip = 'Server configuration issue. Please contact support.';
    statusCode = 500;
  }
  
  res.status(statusCode).json({ 
    success: false,
    error: `Failed to ${context}`,
    details: errorMessage,
    tip: tip,
    timestamp: new Date().toISOString()
  });
};

// ============================================
// CHARACTER GENERATION
// ============================================
exports.createCharacter = async (req, res) => {
  const { prompt, characterType } = req.body;
  const defaultPrompt = characterType 
    ? `Create a ${characterType} character for my game`
    : "Create a unique hero with special powers, detailed backstory, and interesting personality";
  
  const userPrompt = prompt || defaultPrompt;

  try {
    console.log('🎮 Generating character...');
    console.log('📝 User prompt:', userPrompt);
    
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
        validated: validation.isValid,
        generatedWith: 'groq-free'
      }
    });

    console.log('✅ Character created successfully');

    res.json({ 
      success: true,
      character,
      validation,
      savedId: saved._id,
      info: '✅ Generated using Groq FREE API (Fast & Reliable)',
      warning: validation.isValid ? null : 'Some fields may be missing due to AI limitations'
    });
  } catch (err) {
    handleError(err, res, 'generate character');
  }
};

// ============================================
// QUEST GENERATION
// ============================================
exports.generateQuest = async (req, res) => {
  const { prompt, difficulty, questType } = req.body;
  
  let questPrompt = prompt;
  if (!questPrompt) {
    questPrompt = `Create a ${difficulty || 'medium'} difficulty ${questType || 'adventure'} quest`;
  }

  try {
    console.log('🎮 Generating quest...');
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
        validated: validation.isValid,
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      quest,
      validation,
      savedId: saved._id,
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate quest');
  }
};

// ============================================
// DIALOGUE GENERATION
// ============================================
exports.generateDialogue = async (req, res) => {
  const { prompt, npcType, mood } = req.body;
  
  let dialoguePrompt = prompt;
  if (!dialoguePrompt) {
    dialoguePrompt = `Create dialogue for a ${npcType || 'merchant'} NPC who is ${mood || 'friendly'}`;
  }

  try {
    console.log('🎮 Generating dialogue...');
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
        validated: validation.isValid,
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      dialogue,
      validation,
      savedId: saved._id,
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate dialogue');
  }
};

// ============================================
// WORLD GENERATION
// ============================================
exports.generateWorld = async (req, res) => {
  const { prompt, locationType } = req.body;
  
  const worldPrompt = prompt || `Create a detailed ${locationType || 'fantasy'} game world`;

  try {
    console.log('🎮 Generating world...');
    const world = await callGemini(worldPrompt, 'worldBuilding');
    
    const saved = await GameContent.create({ 
      prompt: worldPrompt, 
      response: world,
      type: 'world',
      category: 'worldBuilding',
      metadata: {
        locationType: world.type,
        atmosphere: world.atmosphere,
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      world,
      savedId: saved._id,
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate world');
  }
};

// ============================================
// ENEMY GENERATION
// ============================================
exports.generateEnemy = async (req, res) => {
  const { prompt, level, enemyType } = req.body;
  
  let enemyPrompt = prompt;
  if (!enemyPrompt) {
    enemyPrompt = `Create a level ${level || 10} ${enemyType || 'creature'} enemy`;
  }

  try {
    console.log('🎮 Generating enemy...');
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
        validated: validation.isValid,
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      enemy,
      validation,
      savedId: saved._id,
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate enemy');
  }
};

// ============================================
// ITEM GENERATION
// ============================================
exports.generateItem = async (req, res) => {
  const { prompt, itemType, rarity } = req.body;
  
  let itemPrompt = prompt;
  if (!itemPrompt) {
    itemPrompt = `Create a ${rarity || 'rare'} ${itemType || 'weapon'} item`;
  }

  try {
    console.log('🎮 Generating item...');
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
        validated: validation.isValid,
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      item,
      validation,
      savedId: saved._id,
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate item');
  }
};

// ============================================
// STORY GENERATION
// ============================================
exports.generateStory = async (req, res) => {
  const { prompt, chapter } = req.body;
  
  const storyPrompt = prompt || `Create an engaging story moment for ${chapter || 'the beginning'} of my game`;

  try {
    console.log('🎮 Generating story...');
    const story = await callGemini(storyPrompt, 'storyBeat');
    
    const saved = await GameContent.create({ 
      prompt: storyPrompt, 
      response: story,
      type: 'story',
      category: 'narrative',
      metadata: {
        chapter: story.chapter,
        mood: story.mood,
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      story,
      savedId: saved._id,
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate story');
  }
};

// ============================================
// GENERAL PROMPT HANDLER - FIXED JSON PARSING
// ============================================
exports.handlePrompt = async (req, res) => {
  const { prompt, type } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log('🎮 Processing general prompt...');
    const response = await callGemini(prompt, type || 'text');
    
    // Ensure response is always an object
    let processedResponse;
    if (typeof response === 'string') {
      // Try to parse if it looks like JSON
      try {
        const trimmed = response.trim();
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          processedResponse = JSON.parse(trimmed);
        } else {
          processedResponse = { text: response };
        }
      } catch (parseErr) {
        processedResponse = { text: response };
      }
    } else if (typeof response === 'object' && response !== null) {
      processedResponse = response;
    } else {
      processedResponse = { text: String(response) };
    }
    
    const saved = await GameContent.create({ 
      prompt, 
      response: processedResponse,
      type: type || 'general',
      category: 'custom',
      metadata: {
        generatedWith: 'groq-free',
        timestamp: new Date()
      }
    });

    res.json({ 
      success: true,
      response: processedResponse, 
      savedId: saved._id,
      type: type || 'general',
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (error) {
    handleError(error, res, 'handle prompt');
  }
};

// ============================================
// IMAGE: TEXT TO IMAGE
// ============================================
exports.generateImageFromText = async (req, res) => {
  const { prompt, width, height, model, seed } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log('🎨 Generating image from text...');
    const imageData = await generateImage(prompt, {
      width: width || 512,
      height: height || 512,
      model: model || 'turbo',
      seed: seed || Math.floor(Math.random() * 1000000)
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
        validated: true,
        generatedWith: 'huggingface-free'
      }
    });

    res.json({
      success: true,
      imageUrl: imageData.imageUrl,
      imageData,
      savedId: saved._id,
      info: '✅ Generated using Hugging Face FREE API'
    });
  } catch (err) {
    handleError(err, res, 'generate image');
  }
};

// ============================================
// IMAGE: IMAGE TO IMAGE - FIXED VERSION
// ============================================
exports.generateImageFromImageInput = async (req, res) => {
  try {
    const { prompt, sourceImage, width, height, model, strength, artStyle, seed, assetType } = req.body;

    if (!sourceImage) {
      return res.status(400).json({ 
        success: false,
        error: 'Source image is required (base64 format)'
      });
    }

    console.log('🎨 Starting image-to-image conversion...');
    console.log('📊 Parameters:', { 
      hasPrompt: !!prompt, 
      artStyle, 
      assetType, 
      strength,
      dimensions: `${width || 512}x${height || 512}`
    });

    let enhancedPrompt = prompt;

    // Auto-generate prompt if not provided
    if (!prompt || !prompt.trim()) {
      const assetDescriptions = {
        'character': 'professional game character with detailed design',
        'scene': 'detailed game environment background',
        'item': 'polished game item with clean design',
        'enemy': 'menacing game enemy',
        'ui': 'clean game UI element'
      };
      
      const styleDescriptions = {
        '2d': '2D game art style, hand-painted',
        '3d': '3D rendered style, realistic lighting',
        'anime': 'anime game art style, cel-shaded',
        'pixel': 'pixel art style, retro gaming',
        'realistic': 'photorealistic game graphics'
      };
    
      const assetDesc = assetDescriptions[assetType] || 'professional game asset';
      const styleDesc = styleDescriptions[artStyle] || '2D game art';
      
      enhancedPrompt = `Transform this into ${assetDesc}, ${styleDesc}, high quality`;
      console.log('🤖 Auto-generated prompt:', enhancedPrompt);
    }

    const imageData = await generateImageFromImage(sourceImage, enhancedPrompt, {
      width: width || 512,
      height: height || 512,
      model: model || 'img2img',
      strength: strength || 0.75,
      artStyle: artStyle || '2d',
      seed: seed || Math.floor(Math.random() * 1000000)
    });

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
        validated: true,
        generatedWith: 'huggingface-free'
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
        usedAutoPrompt: !prompt || !prompt.trim()
      },
      info: '✅ Generated using Hugging Face FREE API'
    });

  } catch (err) {
    console.error('❌ Image transformation failed:', err);
    handleError(err, res, 'transform image');
  }
};

// ============================================
// GET SAVED CONTENT
// ============================================
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
    handleError(err, res, 'retrieve content');
  }
};

// ============================================
// GET CONTENT BY ID
// ============================================
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
    handleError(err, res, 'retrieve content by ID');
  }
};

// ============================================
// DELETE CONTENT
// ============================================
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
    handleError(err, res, 'delete content');
  }
};

// ============================================
// GET STATISTICS
// ============================================
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
      byCategory: stats,
      generatedWith: 'groq-free'
    });
  } catch (err) {
    handleError(err, res, 'retrieve statistics');
  }
};