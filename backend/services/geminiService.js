const axios = require("axios");

// ============================================
// GAME CONTENT PROMPTS - MARKDOWN/TEXT FORMAT
// ============================================
const GAME_PROMPTS = {
  character: (userPrompt) => `
You are a professional game designer. Create a detailed game character based on this request: "${userPrompt}"

Format your response in a beautiful, readable text format like this:

[Character Name]
────────────────────────────────────────
Class: [Character class/type]

[Write 3-4 engaging sentences about the character's backstory and origins]

Personality: [Describe their personality traits and quirks]

Abilities:
• [Ability 1]
• [Ability 2]
• [Ability 3]

Stats:
health: [value]
strength: [value]
intelligence: [value]
agility: [value]
charisma: [value]

Equipment: [List equipment items]
Weaknesses: [Character weaknesses]
Motivation: [What drives this character]`,

  quest: (userPrompt) => `
You are a professional quest designer. Create an engaging game quest based on: "${userPrompt}"

Format your response in a beautiful, readable text format like this:

[Quest Title]
════════════════════════════════════════
Type: [main/side/daily] | Difficulty: [easy/medium/hard]

[Write an engaging quest description]

Quest Giver:
  Name: [NPC Name]
  Location: [Where to find them]
  Says: "[What they say]"

Objectives:
  → [Objective 1]
  → [Objective 2]
  → [Objective 3]

Story: [Deeper narrative context]

Rewards:
  Experience: [amount] XP
  Gold: [amount] gold
  Items: [List items]

Tips:
  💡 [Hint 1]
  💡 [Hint 2]`,

  dialogue: (userPrompt) => `
You are a professional game writer. Create natural NPC dialogue for: "${userPrompt}"

Format your response in a beautiful, readable text format like this:

Dialogue with [NPC Name]
────────────────────────────────────────
Role: [NPC's occupation]
Mood: [friendly/hostile/mysterious]
Location: [Where this happens]

Conversation:
NPC: "[What NPC says]"

Player Options:
  1) [Player choice 1]
     → NPC: "[Response to choice 1]"
  
  2) [Player choice 2]
     → NPC: "[Response to choice 2]"

Personality: [NPC personality description]
Quest Hint: [Optional hint if relevant]`,

  worldBuilding: (userPrompt) => `
You are a professional world builder. Create a detailed game world/location based on: "${userPrompt}"

Format your response in a beautiful, readable text format like this:

[Location Name]
════════════════════════════════════════
Type: [city/dungeon/forest/etc]

[Write a vivid 3-4 sentence description]

Atmosphere: [The feeling/mood of this place]

Inhabitants:
  • [Race/creature 1]
  • [Race/creature 2]

Points of Interest:
  ⭐ [POI 1]: [Description]
  ⭐ [POI 2]: [Description]

Resources: [Available resources]
Dangers: [Threats in this area]
Lore: [Historical background]
Climate: [Weather and environment]`,

  enemy: (userPrompt) => `
You are a professional game designer. Create a balanced game enemy based on: "${userPrompt}"

Format your response in a beautiful, readable text format like this:

[Enemy Name]
────────────────────────────────────────
Type: [beast/humanoid/undead/etc] | Level: [number]

[Visual and behavioral description]

Stats:
  Health: [value]
  Attack: [value]
  Defense: [value]
  Speed: [value]

Abilities:
  ⚔️ [Ability 1]: [Damage/Effect] (Cooldown: [time])
  ⚔️ [Ability 2]: [Damage/Effect] (Cooldown: [time])

Weaknesses: [List weaknesses]
Resistances: [List resistances]

Loot Drops:
  Common: [Items]
  Rare: [Items]
  Gold: [Range]

Behavior: [How it fights]
Found in: [Location]`,

  item: (userPrompt) => `
You are a professional item designer. Create a game item based on: "${userPrompt}"

Format your response in a beautiful, readable text format like this:

[Item Name]
════════════════════════════════════════
Type: [weapon/armor/consumable/etc]
Rarity: ⭐⭐⭐ [rare/epic/legendary]

[Flavor text description]

Stats:
  Damage: [value] (if weapon)
  Defense: [value] (if armor)
  Special: [bonus effects]

Effects:
  • [Effect 1]
  • [Effect 2]

Requirements:
  Level: [number]
  Class: [class requirements]

Value: [price] gold
Weight: [number] kg
Durability: [number]/100

Lore: [Item backstory]
How to Obtain: [Where/how to get it]`,

  storyBeat: (userPrompt) => `
You are a professional narrative designer. Create a story moment based on: "${userPrompt}"

Format your response in a beautiful, readable text format like this:

[Story Beat Title]
════════════════════════════════════════
Chapter: [Chapter name/number]
Setting: [Where this happens]
Characters: [Who's involved]

THE CONFLICT:
[Describe the main tension or problem]

THE SCENE:
[Write the detailed narrative - make it immersive and engaging]

PLAYER CHOICES:

  Option 1: [Player choice 1]
    → Consequence: [What happens]
    → Emotional Impact: [How it affects the story]

  Option 2: [Player choice 2]
    → Consequence: [What happens]
    → Emotional Impact: [How it affects the story]

Mood: [tense/hopeful/dark/etc]
Foreshadowing: [Hints about future events]`
};

// ============================================
// ✅ GROQ API - RETURNS PLAIN TEXT
// ============================================
exports.callGemini = async (promptText, type = 'text') => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not found. Get FREE key at: https://console.groq.com');
  }

  const enhancedPrompt = GAME_PROMPTS[type] 
    ? GAME_PROMPTS[type](promptText)
    : promptText;

  console.log('🚀 Generating with Groq (FREE & Fast!)...');
  console.log('📝 Content Type:', type);
  console.log('💬 User Prompt:', promptText);

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional game content generator. Create beautiful, well-formatted text responses. Use Unicode characters like ─, ═, •, →, ⭐, ⚔️, 💡 to make content visually appealing. Do NOT return JSON - return plain, formatted text that is easy to read.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
        top_p: 0.95
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const generatedText = response.data.choices[0].message.content;
    
    console.log('✅ Content generated successfully!');
    console.log('📄 Response length:', generatedText.length, 'characters');

    // Return the raw text as-is
    return generatedText;

  } catch (error) {
    console.error('❌ Groq API Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Wait 1 minute (Groq free tier: 30 requests/min)');
    }
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Get a FREE key at: https://console.groq.com');
    }
    
    if (error.response?.status === 400) {
      throw new Error('Invalid request. Please check your prompt.');
    }
    
    throw new Error(`Groq API error: ${error.message}`);
  }
};

// ============================================
// VALIDATION FUNCTION - SIMPLIFIED
// ============================================
exports.validateGameContent = (content, type) => {
  // For text content, just check if we got something
  if (!content || content.length < 50) {
    return {
      isValid: false,
      error: 'Content too short or empty',
      content
    };
  }

  return {
    isValid: true,
    content,
    format: 'markdown-text'
  };
};

// ============================================
// IMAGE GENERATION - Using FREE Hugging Face Models
// ============================================
const { HfInference } = require("@huggingface/inference");

exports.generateImage = async (prompt, options = {}) => {
  try {
    const HF_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_KEY) {
      throw new Error('HUGGINGFACE_API_KEY not found in .env file');
    }

    const {
      width = 512,
      height = 512,
      model = 'turbo',
      seed = Math.floor(Math.random() * 1000000)
    } = options;

    console.log('🎨 Generating image with Hugging Face FREE serverless inference...');
    console.log('📊 Parameters:', { width, height, model, seed });

    const hf = new HfInference(HF_KEY);

    // Models with FREE serverless inference enabled by default
    const freeModels = [
      'stabilityai/stable-diffusion-2-1',     // SD 2.1 - always free
      'stabilityai/stable-diffusion-xl-base-1.0', // SDXL base - free serverless
      'prompthero/openjourney',               // Openjourney v1 - free
      'SG161222/Realistic_Vision_V2.0',      // Realistic Vision - free
      'dreamlike-art/dreamlike-photoreal-2.0' // Dreamlike - free
    ];

    const modelMapping = {
      'turbo': 'stabilityai/stable-diffusion-2-1',
      'sdxl': 'stabilityai/stable-diffusion-xl-base-1.0',
      'artistic': 'prompthero/openjourney',
      'realistic': 'SG161222/Realistic_Vision_V2.0',
      'photo': 'dreamlike-art/dreamlike-photoreal-2.0'
    };

    const selectedModel = modelMapping[model] || modelMapping['turbo'];
    console.log('🤖 Using FREE serverless model:', selectedModel);

    // Use smaller dimensions for free tier
    const safeWidth = Math.min(width, 768);
    const safeHeight = Math.min(height, 768);

    let blob;
    let usedModel = selectedModel;

    // Try primary model
    try {
      console.log('🔄 Attempting with:', selectedModel);
      blob = await Promise.race([
        hf.textToImage({
          model: selectedModel,
          inputs: prompt,
          parameters: {
            num_inference_steps: 30,
            guidance_scale: 7.5
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 120000) // 2 min timeout
        )
      ]);
      console.log('✅ Primary model succeeded!');
    } catch (primaryError) {
      console.log('⚠️ Primary model failed:', primaryError.message);
      console.log('🔄 Trying fallback FREE serverless models...');
      
      // Try fallback models one by one
      for (const fallbackModel of freeModels) {
        if (fallbackModel === selectedModel) continue; // Skip already tried model
        
        try {
          console.log('🔄 Trying fallback:', fallbackModel);
          blob = await Promise.race([
            hf.textToImage({
              model: fallbackModel,
              inputs: prompt,
              parameters: {
                num_inference_steps: 30,
                guidance_scale: 7.5
              }
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('timeout')), 120000)
            )
          ]);
          usedModel = fallbackModel;
          console.log('✅ Fallback model succeeded:', fallbackModel);
          break;
        } catch (fallbackError) {
          console.log('❌ Fallback failed:', fallbackModel, '-', fallbackError.message);
          continue;
        }
      }

      if (!blob) {
        throw new Error('All FREE serverless models are currently busy. This is a temporary Hugging Face issue. Solutions: 1) Wait 10-15 minutes, 2) Try during off-peak hours (late night/early morning), 3) Use smaller dimensions (256x256)');
      }
    }

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    console.log('✅ Image generated successfully with:', usedModel);

    return {
      imageUrl,
      prompt,
      model: usedModel,
      seed,
      width: safeWidth,
      height: safeHeight,
      source: 'huggingface-free-serverless',
      format: 'base64',
      note: 'Generated with 100% FREE serverless inference (no payment required)'
    };

  } catch (error) {
    console.error('❌ Image generation error:', error.message);
    
    if (error.message === 'timeout') {
      throw new Error('Image generation timed out. Models are experiencing heavy load. Try again in 10-15 minutes or use a simpler prompt.');
    }
    
    if (error.response?.status === 503 || error.message.includes('loading')) {
      throw new Error('Model is starting up (cold start). Please wait 60-90 seconds and try again.');
    }

    if (error.message.includes('Provider') || error.message.includes('inference')) {
      throw new Error('Hugging Face free tier is temporarily overloaded. Try again in 10-15 minutes or during off-peak hours.');
    }

    if (error.message.includes('credits') || error.message.includes('payment')) {
      throw new Error('Payment model detected. All free models are busy. Try again in 10-15 minutes.');
    }
    
    throw new Error(`Image generation failed: ${error.message}`);
  }
};

// ============================================
// IMAGE TO IMAGE
// ============================================
exports.generateImageFromImage = async (sourceImageBase64, prompt, options = {}) => {
  try {
    const HF_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_KEY) {
      throw new Error('HUGGINGFACE_API_KEY not found');
    }

    const {
      width = 512,
      height = 512,
      strength = 0.75,
      seed = Math.floor(Math.random() * 1000000),
      artStyle = '2d'
    } = options;

    console.log('🎨 Starting image-to-image transformation...');
    console.log('📊 Parameters:', { width, height, strength, artStyle, seed });

    const hf = new HfInference(HF_KEY);

    const styleEnhancers = {
      '2d': 'professional 2D game art, hand-painted style, clean lines',
      '3d': '3D rendered game asset, realistic lighting, detailed textures',
      'anime': 'anime game art style, cel-shaded, vibrant colors',
      'pixel': 'pixel art game sprite, retro gaming style, clear pixels',
      'realistic': 'photorealistic game graphics, high detail, professional quality'
    };

    const enhancedPrompt = `${prompt}, ${styleEnhancers[artStyle] || styleEnhancers['2d']}, high quality, professional game asset`;
    console.log('✨ Enhanced prompt:', enhancedPrompt);

    let imageBlob;
    try {
      let base64Data = sourceImageBase64;
      
      if (sourceImageBase64.includes('data:image')) {
        base64Data = sourceImageBase64.split(',')[1];
      }
      
      base64Data = base64Data.replace(/\s/g, '');
      
      const binaryData = Buffer.from(base64Data, 'base64');
      imageBlob = new Blob([binaryData], { type: 'image/png' });
      
      console.log('✅ Image blob created:', imageBlob.size, 'bytes');
    } catch (blobError) {
      console.error('❌ Blob creation failed:', blobError);
      throw new Error('Invalid image data format. Please provide valid base64 image.');
    }

    try {
      console.log('🔄 Attempting image-to-image transformation...');
      
      const blob = await Promise.race([
        hf.imageToImage({
          model: 'timbrooks/instruct-pix2pix',
          inputs: imageBlob,
          parameters: {
            prompt: enhancedPrompt,
            negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy',
            num_inference_steps: 30,
            guidance_scale: 7.5,
            image_guidance_scale: 1.5,
            strength: strength
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 90000)
        )
      ]);

      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = buffer.toString('base64');
      const imageUrl = `data:image/png;base64,${base64Image}`;

      console.log('✅ Image-to-image transformation successful!');

      return {
        imageUrl,
        prompt: enhancedPrompt,
        originalPrompt: prompt,
        model: 'timbrooks/instruct-pix2pix',
        seed,
        width,
        height,
        artStyle,
        strength,
        source: 'huggingface',
        format: 'base64',
        transformationType: 'image-to-image',
        success: true
      };

    } catch (img2imgError) {
      console.log('⚠️ Image-to-image failed, falling back to text-to-image...');
      console.log('Error:', img2imgError.message);
      
      const fallbackResult = await exports.generateImage(enhancedPrompt, { 
        width: 512,
        height: 512,
        model: 'turbo', 
        seed 
      });
      
      return {
        ...fallbackResult,
        artStyle,
        strength,
        transformationType: 'text-to-image-fallback',
        fallbackReason: img2imgError.message,
        note: 'Used text-to-image as fallback'
      };
    }

  } catch (error) {
    console.error('❌ Image-to-image transformation error:', error);
    
    if (error.message.includes('timeout')) {
      throw new Error('Image transformation timed out. Try again in 60 seconds.');
    }
    
    if (error.message.includes('Invalid image')) {
      throw new Error('Invalid source image. Please provide valid base64 image.');
    }
    
    throw new Error(`Image transformation failed: ${error.message}`);
  }
};

exports.createGameAssetPrompt = (type, userDescription, style = '2d') => {
  const templates = {
    character: {
      '2d': `${userDescription}, professional 2D game character art, hand-painted style, detailed design`,
      '3d': `${userDescription}, 3D game character model, realistic rendering, high quality`,
      'anime': `${userDescription}, anime game character art, cel-shaded, vibrant colors`,
      'pixel': `${userDescription}, pixel art character sprite, retro gaming style`
    },
    scene: {
      '2d': `${userDescription}, 2D game environment art, detailed background`,
      '3d': `${userDescription}, 3D game environment, realistic lighting`,
      'realistic': `${userDescription}, photorealistic game environment, high detail`
    },
    item: {
      '2d': `${userDescription}, game item icon, clean design, professional quality`,
      '3d': `${userDescription}, 3D game item render, detailed textures`,
      'pixel': `${userDescription}, pixel art item icon, retro gaming style`
    },
    enemy: {
      '2d': `${userDescription}, 2D game enemy design, menacing appearance`,
      '3d': `${userDescription}, 3D game enemy model, detailed and intimidating`
    }
  };

  return templates[type]?.[style] || `${userDescription}, professional game art, high quality`;
};