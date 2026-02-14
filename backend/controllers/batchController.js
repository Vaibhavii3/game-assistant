const { callGemini, validateGameContent, generateImage } = require('../services/geminiService');
const GameContent = require('../models/propmtModel');

exports.batchGenerate = async (req, res) => {
  try {
    const { type, count, basePrompt, variations = false, saveToDb = true } = req.body;

    // Validation
    if (!type) {
      return res.status(400).json({ error: 'Content type is required' });
    }

    if (!count || count < 1 || count > 20) {
      return res.status(400).json({ 
        error: 'Count must be between 1 and 20',
        hint: 'For larger batches, use the queue-based system'
      });
    }

    if (!basePrompt) {
      return res.status(400).json({ error: 'Base prompt is required' });
    }

    console.log(`🔥 Starting batch generation: ${count}x ${type}`);
    console.log(`📝 Base Prompt: ${basePrompt}`);

    const results = [];
    const errors = [];
    const startTime = Date.now();

    // Generate each item
    for (let i = 0; i < count; i++) {
      try {
        console.log(`⚙️ Generating ${i + 1}/${count}...`);

        // Create variation prompt if enabled
        let prompt = basePrompt;
        if (variations) {
          prompt = addVariation(basePrompt, i, type);
        }

        // Generate content
        const content = await callGemini(prompt, type);

        // Validate
        const validation = validateGameContent(content, type);

        // Save to database if requested
        let savedId = null;
        if (saveToDb) {
          const saved = await GameContent.create({
            prompt,
            response: content,
            type,
            category: type,
            metadata: {
              batchGeneration: true,
              batchIndex: i,
              batchSize: count,
              validated: validation.isValid
            }
          });
          savedId = saved._id;
        }

        // Store result with properly formatted content
        results.push({
          index: i + 1,
          prompt,
          content,
          contentJson: JSON.stringify(content, null, 2), // Pretty formatted JSON
          validation,
          savedId,
          success: true
        });

      } catch (err) {
        console.error(`❌ Error generating item ${i + 1}:`, err.message);
        errors.push({
          index: i + 1,
          error: err.message
        });

        results.push({
          index: i + 1,
          success: false,
          error: err.message
        });
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const successCount = results.filter(r => r.success).length;

    console.log(`✅ Batch generation completed in ${duration}s`);
    console.log(`✅ Success: ${successCount}/${count}`);
    console.log(`❌ Failed: ${errors.length}/${count}`);

    res.json({
      success: true,
      message: `Generated ${successCount} out of ${count} items`,
      stats: {
        total: count,
        successful: successCount,
        failed: errors.length,
        duration: `${duration}s`,
        averageTime: `${(duration / count).toFixed(2)}s per item`
      },
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('❌ Batch generation error:', err);
    res.status(500).json({
      error: 'Batch generation failed',
      details: err.message
    });
  }
};

exports.batchGenerateWorld = async (req, res) => {
  try {
    const { theme, characters = 0, quests = 0, enemies = 0, items = 0, locations = 0 } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    const total = characters + quests + enemies + items + locations;
    if (total === 0) {
      return res.status(400).json({ error: 'At least one content type count must be > 0' });
    }

    if (total > 30) {
      return res.status(400).json({ 
        error: 'Total content pieces cannot exceed 30',
        current: total 
      });
    }

    console.log(`🌍 Generating complete world: ${theme}`);
    console.log(`📊 Total pieces: ${total}`);

    const results = {
      theme,
      characters: [],
      quests: [],
      enemies: [],
      items: [],
      locations: []
    };

    const startTime = Date.now();

    // Generate Characters
    if (characters > 0) {
      console.log(`👥 Generating ${characters} characters...`);
      for (let i = 0; i < characters; i++) {
        try {
          const prompt = `Create a character for a ${theme} game world`;
          const content = await callGemini(prompt, 'character');
          const saved = await GameContent.create({
            prompt,
            response: content,
            type: 'character',
            category: 'character',
            metadata: { worldTheme: theme, batchGeneration: true }
          });
          results.characters.push({ 
            content, 
            contentJson: JSON.stringify(content, null, 2),
            savedId: saved._id 
          });
        } catch (err) {
          console.error(`Error generating character ${i + 1}:`, err.message);
        }
      }
    }

    // Generate Quests
    if (quests > 0) {
      console.log(`📜 Generating ${quests} quests...`);
      for (let i = 0; i < quests; i++) {
        try {
          const prompt = `Create a quest in a ${theme} setting`;
          const content = await callGemini(prompt, 'quest');
          const saved = await GameContent.create({
            prompt,
            response: content,
            type: 'quest',
            category: 'quest',
            metadata: { worldTheme: theme, batchGeneration: true }
          });
          results.quests.push({ 
            content, 
            contentJson: JSON.stringify(content, null, 2),
            savedId: saved._id 
          });
        } catch (err) {
          console.error(`Error generating quest ${i + 1}:`, err.message);
        }
      }
    }

    // Generate Enemies
    if (enemies > 0) {
      console.log(`⚔️ Generating ${enemies} enemies...`);
      for (let i = 0; i < enemies; i++) {
        try {
          const prompt = `Create an enemy for a ${theme} game`;
          const content = await callGemini(prompt, 'enemy');
          const saved = await GameContent.create({
            prompt,
            response: content,
            type: 'enemy',
            category: 'enemy',
            metadata: { worldTheme: theme, batchGeneration: true }
          });
          results.enemies.push({ 
            content, 
            contentJson: JSON.stringify(content, null, 2),
            savedId: saved._id 
          });
        } catch (err) {
          console.error(`Error generating enemy ${i + 1}:`, err.message);
        }
      }
    }

    // Generate Items
    if (items > 0) {
      console.log(`🛡️ Generating ${items} items...`);
      for (let i = 0; i < items; i++) {
        try {
          const prompt = `Create an item for a ${theme} game world`;
          const content = await callGemini(prompt, 'item');
          const saved = await GameContent.create({
            prompt,
            response: content,
            type: 'item',
            category: 'item',
            metadata: { worldTheme: theme, batchGeneration: true }
          });
          results.items.push({ 
            content, 
            contentJson: JSON.stringify(content, null, 2),
            savedId: saved._id 
          });
        } catch (err) {
          console.error(`Error generating item ${i + 1}:`, err.message);
        }
      }
    }

    // Generate Locations
    if (locations > 0) {
      console.log(`🗺️ Generating ${locations} locations...`);
      for (let i = 0; i < locations; i++) {
        try {
          const prompt = `Create a location in a ${theme} game world`;
          const content = await callGemini(prompt, 'world');
          const saved = await GameContent.create({
            prompt,
            response: content,
            type: 'world',
            category: 'worldBuilding',
            metadata: { worldTheme: theme, batchGeneration: true }
          });
          results.locations.push({ 
            content, 
            contentJson: JSON.stringify(content, null, 2),
            savedId: saved._id 
          });
        } catch (err) {
          console.error(`Error generating location ${i + 1}:`, err.message);
        }
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✅ World generation completed in ${duration}s`);

    res.json({
      success: true,
      message: `Complete ${theme} world generated!`,
      stats: {
        theme,
        totalPieces: total,
        duration: `${duration}s`,
        breakdown: {
          characters: results.characters.length,
          quests: results.quests.length,
          enemies: results.enemies.length,
          items: results.items.length,
          locations: results.locations.length
        }
      },
      results
    });

  } catch (err) {
    console.error('❌ World generation error:', err);
    res.status(500).json({
      error: 'World generation failed',
      details: err.message
    });
  }
};

exports.batchGenerateImages = async (req, res) => {
  try {
    const { prompts, artStyle = '2d', width = 1024, height = 1024 } = req.body;

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ error: 'Prompts array is required' });
    }

    if (prompts.length > 10) {
      return res.status(400).json({ 
        error: 'Maximum 10 images per batch',
        hint: 'Use multiple batch requests for more images'
      });
    }

    console.log(`🎨 Generating ${prompts.length} images...`);

    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < prompts.length; i++) {
      try {
        console.log(`🖼️ Generating image ${i + 1}/${prompts.length}...`);

        const imageData = await generateImage(prompts[i], {
          width,
          height,
          model: 'flux',
          seed: Math.floor(Math.random() * 1000000)
        });

        const saved = await GameContent.create({
          prompt: prompts[i],
          response: imageData,
          type: 'image',
          category: 'image',
          metadata: {
            batchGeneration: true,
            batchIndex: i,
            imageModel: imageData.model,
            dimensions: `${width}x${height}`,
            artStyle
          }
        });

        results.push({
          index: i + 1,
          prompt: prompts[i],
          imageUrl: imageData.imageUrl,
          imageData,
          savedId: saved._id,
          success: true
        });

      } catch (err) {
        console.error(`❌ Image ${i + 1} failed:`, err.message);
        results.push({
          index: i + 1,
          prompt: prompts[i],
          success: false,
          error: err.message
        });
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const successful = results.filter(r => r.success).length;

    res.json({
      success: true,
      message: `Generated ${successful} out of ${prompts.length} images`,
      stats: {
        total: prompts.length,
        successful,
        failed: prompts.length - successful,
        duration: `${duration}s`
      },
      results
    });

  } catch (err) {
    console.error('❌ Batch image generation error:', err);
    res.status(500).json({
      error: 'Batch image generation failed',
      details: err.message
    });
  }
};

exports.batchGenerateVariations = async (req, res) => {
  try {
    const { contentId, count, variationType = 'style' } = req.body;

    if (!contentId) {
      return res.status(400).json({ error: 'Content ID is required' });
    }

    if (count < 1 || count > 10) {
      return res.status(400).json({ error: 'Count must be between 1 and 10' });
    }

    // Get original content
    const original = await GameContent.findById(contentId);
    if (!original) {
      return res.status(404).json({ error: 'Content not found' });
    }

    console.log(`🔄 Generating ${count} variations of type: ${variationType}`);

    const variations = [];

    for (let i = 0; i < count; i++) {
      try {
        const variationPrompt = createVariationPrompt(
          original.prompt,
          original.type,
          variationType,
          i
        );

        const content = await callGemini(variationPrompt, original.type);

        const saved = await GameContent.create({
          prompt: variationPrompt,
          response: content,
          type: original.type,
          category: original.category,
          metadata: {
            isVariation: true,
            originalId: contentId,
            variationType,
            variationIndex: i
          }
        });

        variations.push({
          index: i + 1,
          content,
          contentJson: JSON.stringify(content, null, 2),
          savedId: saved._id
        });
      } catch (err) {
        console.error(`Error generating variation ${i + 1}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: `Generated ${variations.length} variations`,
      original: {
        id: original._id,
        type: original.type,
        prompt: original.prompt
      },
      variations
    });

  } catch (err) {
    console.error('❌ Variation generation error:', err);
    res.status(500).json({
      error: 'Variation generation failed',
      details: err.message
    });
  }
};


function addVariation(basePrompt, index, type) {
  const variations = {
    character: [
      'with ice abilities',
      'with fire powers',
      'as a stealthy rogue',
      'as a tank warrior',
      'with healing magic'
    ],
    enemy: [
      'as a boss enemy',
      'as a common mob',
      'with ranged attacks',
      'with melee focus',
      'with magical abilities'
    ],
    quest: [
      'as a main story quest',
      'as a side quest',
      'as a daily challenge',
      'with moral choices',
      'with time limit'
    ],
    item: [
      'as a legendary item',
      'as a rare weapon',
      'as common loot',
      'with unique effect',
      'with set bonus'
    ],
    dialogue: [
      'for a friendly NPC',
      'for a mysterious NPC',
      'for a merchant NPC',
      'for an aggressive NPC',
      'for a quest giver'
    ],
    world: [
      'with dark atmosphere',
      'with vibrant colors',
      'with mysterious elements',
      'with dangerous areas',
      'with hidden secrets'
    ],
    story: [
      'with dramatic tension',
      'with mystery elements',
      'with action focus',
      'with emotional depth',
      'with plot twist'
    ]
  };

  const typeVariations = variations[type] || ['variation 1', 'variation 2', 'variation 3'];
  const variation = typeVariations[index % typeVariations.length];

  return `${basePrompt} ${variation}`;
}

function createVariationPrompt(originalPrompt, contentType, variationType, index) {
  const variationStyles = {
    style: ['in anime style', 'in realistic style', 'in cartoon style', 'in dark fantasy style'],
    stats: ['with higher stats', 'with balanced stats', 'with specialized stats', 'with unique abilities'],
    personality: ['with friendly personality', 'with aggressive personality', 'with mysterious personality', 'with heroic personality'],
    difficulty: ['easier version', 'harder version', 'nightmare difficulty', 'beginner friendly']
  };

  const styles = variationStyles[variationType] || variationStyles.style;
  const modifier = styles[index % styles.length];

  return `${originalPrompt} but ${modifier}`;
}

module.exports = exports;