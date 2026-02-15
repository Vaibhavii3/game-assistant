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
  
  if (errorMessage.includes('rate') || errorMessage.includes('429')) {
    errorMessage = 'Rate limit exceeded';
    tip = 'Please wait 5-10 minutes before trying again. Free tier has limited requests.';
    statusCode = 429;
  }
  else if (errorMessage.includes('timeout')) {
    errorMessage = 'Request timed out';
    tip = 'The API took too long. Try again with a simpler prompt or wait a moment.';
    statusCode = 504;
  }
  else if (errorMessage.includes('All models failed')) {
    errorMessage = 'All AI models are currently unavailable';
    tip = 'Hugging Face free tier may be experiencing high traffic. Try again in 10-15 minutes.';
    statusCode = 503;
  }
  else if (errorMessage.includes('loading') || errorMessage.includes('503')) {
    errorMessage = 'Model is loading';
    tip = 'The AI model is starting up (cold start). Please wait 30-60 seconds and try again.';
    statusCode = 503;
  }
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
// CHARACTER GENERATION - TEXT FORMAT
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
    
    const characterText = await callGemini(userPrompt, 'character');
    
    const validation = validateGameContent(characterText, 'character');
    
    const saved = await GameContent.create({ 
      prompt: userPrompt, 
      response: { text: characterText }, // Store as text
      type: 'character',
      category: 'character',
      metadata: {
        format: 'markdown-text',
        validated: validation.isValid,
        generatedWith: 'groq-free'
      }
    });

    console.log('✅ Character created successfully');

    res.json({ 
      success: true,
      character: characterText, // Return plain text
      validation,
      savedId: saved._id,
      format: 'markdown-text',
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate character');
  }
};

// ============================================
// QUEST GENERATION - TEXT FORMAT
// ============================================
exports.generateQuest = async (req, res) => {
  const { prompt, difficulty, questType } = req.body;
  
  let questPrompt = prompt;
  if (!questPrompt) {
    questPrompt = `Create a ${difficulty || 'medium'} difficulty ${questType || 'adventure'} quest`;
  }

  try {
    console.log('🎮 Generating quest...');
    const questText = await callGemini(questPrompt, 'quest');
    
    const validation = validateGameContent(questText, 'quest');
    
    const saved = await GameContent.create({ 
      prompt: questPrompt, 
      response: { text: questText },
      type: 'quest',
      category: 'quest',
      metadata: {
        format: 'markdown-text',
        validated: validation.isValid,
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      quest: questText, // Return plain text
      validation,
      savedId: saved._id,
      format: 'markdown-text',
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate quest');
  }
};

// ============================================
// DIALOGUE GENERATION - TEXT FORMAT
// ============================================
exports.generateDialogue = async (req, res) => {
  const { prompt, npcType, mood } = req.body;
  
  let dialoguePrompt = prompt;
  if (!dialoguePrompt) {
    dialoguePrompt = `Create dialogue for a ${npcType || 'merchant'} NPC who is ${mood || 'friendly'}`;
  }

  try {
    console.log('🎮 Generating dialogue...');
    const dialogueText = await callGemini(dialoguePrompt, 'dialogue');
    
    const validation = validateGameContent(dialogueText, 'dialogue');
    
    const saved = await GameContent.create({ 
      prompt: dialoguePrompt, 
      response: { text: dialogueText },
      type: 'dialogue',
      category: 'dialogue',
      metadata: {
        format: 'markdown-text',
        validated: validation.isValid,
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      dialogue: dialogueText,
      validation,
      savedId: saved._id,
      format: 'markdown-text',
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate dialogue');
  }
};

// ============================================
// WORLD GENERATION - TEXT FORMAT
// ============================================
exports.generateWorld = async (req, res) => {
  const { prompt, locationType } = req.body;
  
  const worldPrompt = prompt || `Create a detailed ${locationType || 'fantasy'} game world`;

  try {
    console.log('🎮 Generating world...');
    const worldText = await callGemini(worldPrompt, 'worldBuilding');
    
    const saved = await GameContent.create({ 
      prompt: worldPrompt, 
      response: { text: worldText },
      type: 'world',
      category: 'worldBuilding',
      metadata: {
        format: 'markdown-text',
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      world: worldText,
      savedId: saved._id,
      format: 'markdown-text',
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate world');
  }
};

// ============================================
// ENEMY GENERATION - TEXT FORMAT
// ============================================
exports.generateEnemy = async (req, res) => {
  const { prompt, level, enemyType } = req.body;
  
  let enemyPrompt = prompt;
  if (!enemyPrompt) {
    enemyPrompt = `Create a level ${level || 10} ${enemyType || 'creature'} enemy`;
  }

  try {
    console.log('🎮 Generating enemy...');
    const enemyText = await callGemini(enemyPrompt, 'enemy');
    
    const validation = validateGameContent(enemyText, 'enemy');
    
    const saved = await GameContent.create({ 
      prompt: enemyPrompt, 
      response: { text: enemyText },
      type: 'enemy',
      category: 'enemy',
      metadata: {
        format: 'markdown-text',
        validated: validation.isValid,
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      enemy: enemyText,
      validation,
      savedId: saved._id,
      format: 'markdown-text',
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate enemy');
  }
};

// ============================================
// ITEM GENERATION - TEXT FORMAT
// ============================================
exports.generateItem = async (req, res) => {
  const { prompt, itemType, rarity } = req.body;
  
  let itemPrompt = prompt;
  if (!itemPrompt) {
    itemPrompt = `Create a ${rarity || 'rare'} ${itemType || 'weapon'} item`;
  }

  try {
    console.log('🎮 Generating item...');
    const itemText = await callGemini(itemPrompt, 'item');
    
    const validation = validateGameContent(itemText, 'item');
    
    const saved = await GameContent.create({ 
      prompt: itemPrompt, 
      response: { text: itemText },
      type: 'item',
      category: 'item',
      metadata: {
        format: 'markdown-text',
        validated: validation.isValid,
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      item: itemText,
      validation,
      savedId: saved._id,
      format: 'markdown-text',
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate item');
  }
};

// ============================================
// STORY GENERATION - TEXT FORMAT
// ============================================
exports.generateStory = async (req, res) => {
  const { prompt, chapter } = req.body;
  
  const storyPrompt = prompt || `Create an engaging story moment for ${chapter || 'the beginning'} of my game`;

  try {
    console.log('🎮 Generating story...');
    const storyText = await callGemini(storyPrompt, 'storyBeat');
    
    const saved = await GameContent.create({ 
      prompt: storyPrompt, 
      response: { text: storyText },
      type: 'story',
      category: 'narrative',
      metadata: {
        format: 'markdown-text',
        generatedWith: 'groq-free'
      }
    });

    res.json({ 
      success: true,
      story: storyText,
      savedId: saved._id,
      format: 'markdown-text',
      info: '✅ Generated using Groq FREE API (Fast & Reliable)'
    });
  } catch (err) {
    handleError(err, res, 'generate story');
  }
};

// ============================================
// GENERAL PROMPT HANDLER - TEXT FORMAT
// ============================================
exports.handlePrompt = async (req, res) => {
  const { prompt, type } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log('🎮 Processing general prompt...');
    const responseText = await callGemini(prompt, type || 'text');
    
    const saved = await GameContent.create({ 
      prompt, 
      response: { text: responseText },
      type: type || 'general',
      category: 'custom',
      metadata: {
        format: 'markdown-text',
        generatedWith: 'groq-free',
        timestamp: new Date()
      }
    });

    res.json({ 
      success: true,
      response: responseText, 
      savedId: saved._id,
      type: type || 'general',
      format: 'markdown-text',
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
// IMAGE: IMAGE TO IMAGE
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

    let enhancedPrompt = prompt;

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