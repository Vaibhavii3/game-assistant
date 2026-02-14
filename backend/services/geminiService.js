const axios = require("axios");

// ============================================
// GAME CONTENT PROMPTS
// ============================================
const GAME_PROMPTS = {
  character: (userPrompt) => `
You are a professional game designer. Create a detailed game character based on this request: "${userPrompt}"

CRITICAL: You MUST return ONLY a valid JSON object. No markdown, no code blocks, no extra text.

Return this EXACT structure:
{
  "name": "Character name",
  "class": "Character class/type",
  "backstory": "Detailed 3-4 sentence backstory",
  "personality": "Personality traits and quirks",
  "abilities": ["ability1", "ability2", "ability3"],
  "stats": {
    "health": 100,
    "strength": 75,
    "intelligence": 80,
    "agility": 70,
    "charisma": 65
  },
  "equipment": ["item1", "item2"],
  "weaknesses": "Character weaknesses",
  "motivation": "What drives this character"
}`,

  quest: (userPrompt) => `
You are a professional quest designer. Create an engaging game quest based on: "${userPrompt}"

CRITICAL: You MUST return ONLY a valid JSON object. No markdown, no code blocks, no extra text.

Return this EXACT structure:
{
  "title": "Quest name",
  "type": "main",
  "difficulty": "medium",
  "description": "Engaging quest description",
  "objectives": [
    {"task": "objective 1", "completed": false},
    {"task": "objective 2", "completed": false}
  ],
  "rewards": {
    "experience": 500,
    "gold": 250,
    "items": ["reward item 1", "reward item 2"]
  },
  "npc": {
    "name": "Quest giver name",
    "location": "Where to find them",
    "dialogue": "What they say when giving quest"
  },
  "story": "Deeper narrative context",
  "tips": ["hint 1", "hint 2"]
}`,

  dialogue: (userPrompt) => `
You are a professional game writer. Create natural NPC dialogue for: "${userPrompt}"

CRITICAL: You MUST return ONLY a valid JSON object. No markdown, no code blocks, no extra text.

Return this EXACT structure:
{
  "npcName": "NPC name",
  "npcRole": "Role/occupation",
  "mood": "friendly",
  "location": "Where this dialogue happens",
  "dialogueOptions": [
    {
      "npcLine": "What NPC says",
      "playerChoices": [
        {"text": "Player option 1", "response": "NPC response to option 1"},
        {"text": "Player option 2", "response": "NPC response to option 2"}
      ]
    }
  ],
  "questHint": "Optional quest hint if relevant",
  "personality": "NPC personality description"
}`,

  worldBuilding: (userPrompt) => `
You are a professional world builder. Create a detailed game world/location based on: "${userPrompt}"

CRITICAL: You MUST return ONLY a valid JSON object. No markdown, no code blocks, no extra text.

Return this EXACT structure:
{
  "name": "Location name",
  "type": "city",
  "description": "Vivid 3-4 sentence description",
  "atmosphere": "The feeling/mood of this place",
  "inhabitants": ["race/creature 1", "race/creature 2"],
  "pointsOfInterest": [
    {"name": "POI 1", "description": "What's special here"}
  ],
  "resources": ["resource 1", "resource 2"],
  "dangers": ["danger 1", "danger 2"],
  "lore": "Historical background",
  "climate": "Weather and environment",
  "economy": "What drives this place"
}`,

  enemy: (userPrompt) => `
You are a professional game designer. Create a balanced game enemy based on: "${userPrompt}"

CRITICAL: You MUST return ONLY a valid JSON object. No markdown, no code blocks, no extra text.

Return this EXACT structure:
{
  "name": "Enemy name",
  "type": "beast",
  "level": 10,
  "description": "Visual and behavioral description",
  "stats": {
    "health": 500,
    "attack": 75,
    "defense": 50,
    "speed": 60
  },
  "abilities": [
    {"name": "ability 1", "damage": 50, "cooldown": 5}
  ],
  "weaknesses": ["weakness 1", "weakness 2"],
  "resistances": ["resistance 1"],
  "loot": {
    "common": ["item 1", "item 2"],
    "rare": ["rare item 1"],
    "gold": "50-200"
  },
  "behavior": "How it fights",
  "location": "Where it's found"
}`,

  item: (userPrompt) => `
You are a professional item designer. Create a game item based on: "${userPrompt}"

CRITICAL: You MUST return ONLY a valid JSON object. No markdown, no code blocks, no extra text.

Return this EXACT structure:
{
  "name": "Item name",
  "type": "weapon",
  "rarity": "rare",
  "description": "Flavor text description",
  "stats": {
    "damage": 75,
    "defense": 0,
    "bonus": "+10 Strength"
  },
  "effects": ["effect 1", "effect 2"],
  "requirements": {
    "level": 10,
    "class": "any"
  },
  "value": 500,
  "weight": 5,
  "durability": 100,
  "lore": "Item backstory",
  "obtainedFrom": "How to get this item"
}`,

  storyBeat: (userPrompt) => `
You are a professional narrative designer. Create a story moment based on: "${userPrompt}"

CRITICAL: You MUST return ONLY a valid JSON object. No markdown, no code blocks, no extra text.

Return this EXACT structure:
{
  "title": "Story beat title",
  "chapter": "Chapter 1",
  "setting": "Where this happens",
  "characters": ["character 1", "character 2"],
  "conflict": "The main tension/problem",
  "scene": "Detailed narrative description",
  "choices": [
    {
      "option": "Player choice 1",
      "consequence": "What happens",
      "emotionalImpact": "How it affects story"
    }
  ],
  "mood": "tense",
  "foreshadowing": "Hints about future events"
}`
};

// ============================================
// IMPROVED JSON PARSER
// ============================================
const parseJSONResponse = (text, type) => {
  try {
    let cleanedText = text.trim();
    
    console.log('🔍 Parsing response...');
    console.log('📝 Original length:', text.length);
    
    // Remove markdown code blocks
    cleanedText = cleanedText.replace(/^```json\s*/i, '');
    cleanedText = cleanedText.replace(/^```\s*/i, '');
    cleanedText = cleanedText.replace(/\s*```$/i, '');
    cleanedText = cleanedText.trim();
    
    // Remove any text before the first { or [
    const jsonStart = cleanedText.search(/[\{\[]/);
    if (jsonStart > 0) {
      cleanedText = cleanedText.substring(jsonStart);
    }
    
    // Remove any text after the last } or ]
    const jsonEnd = Math.max(
      cleanedText.lastIndexOf('}'),
      cleanedText.lastIndexOf(']')
    );
    if (jsonEnd > -1 && jsonEnd < cleanedText.length - 1) {
      cleanedText = cleanedText.substring(0, jsonEnd + 1);
    }
    
    console.log('✂️ Cleaned text length:', cleanedText.length);
    
    // Try to parse
    const parsed = JSON.parse(cleanedText);
    console.log('✅ Successfully parsed JSON');
    return parsed;

  } catch (parseError) {
    console.warn('⚠️ JSON parse failed:', parseError.message);
    console.log('📄 Problematic text:', text.substring(0, 200));
    
    // Try to extract JSON object using regex
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extracted = JSON.parse(jsonMatch[0]);
        console.log('✅ Extracted JSON using regex');
        return extracted;
      }
    } catch (regexError) {
      console.warn('⚠️ Regex extraction also failed');
    }
    
    // Last resort: return error object
    return {
      rawText: text,
      error: 'Could not parse as JSON',
      parseError: parseError.message,
      note: 'AI returned non-JSON response',
      type: type
    };
  }
};

// ============================================
// ✅ GROQ API - FREE & WORKS EVERYWHERE! 
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
        model: 'llama-3.3-70b-versatile', // FREE model - very good quality!
        messages: [
          {
            role: 'system',
            content: 'You are a professional game content generator. Always return valid JSON objects without markdown code blocks or extra text. Never include ```json or ``` in your response.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
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

    // Parse JSON if structured content
    if (GAME_PROMPTS[type]) {
      return parseJSONResponse(generatedText, type);
    }
    
    // For text type, try to parse as JSON, but return text if not
    if (type === 'text') {
      const trimmed = generatedText.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
          (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          return parseJSONResponse(generatedText, type);
        } catch (e) {
          return generatedText;
        }
      }
      return generatedText;
    }
    
    return generatedText;

  } catch (error) {
    console.error('❌ Groq API Error:', error.response?.data || error.message);
    
    // Better error messages
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
// VALIDATION FUNCTION
// ============================================
exports.validateGameContent = (content, type) => {
  // Handle error objects
  if (content && content.error) {
    return {
      isValid: false,
      missing: ['All fields (parse error)'],
      content,
      error: content.error
    };
  }

  const validations = {
    character: ['name', 'class', 'backstory'],
    quest: ['title', 'description', 'objectives'],
    dialogue: ['npcName', 'dialogueOptions'],
    enemy: ['name', 'type', 'stats'],
    item: ['name', 'type', 'rarity'],
    storyBeat: ['title', 'scene', 'choices']
  };

  const required = validations[type] || [];
  const missing = required.filter(field => !content[field]);
  
  return {
    isValid: missing.length === 0,
    missing,
    content
  };
};

// ============================================
// IMAGE GENERATION - Using Hugging Face
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

    console.log('🎨 Generating image with Hugging Face...');
    console.log('📊 Parameters:', { width, height, model, seed });

    const hf = new HfInference(HF_KEY);

    const modelMapping = {
      'turbo': 'stabilityai/sdxl-turbo',
      'flux': 'black-forest-labs/FLUX.1-schnell',
      'sd': 'runwayml/stable-diffusion-v1-5'
    };

    const selectedModel = modelMapping[model] || modelMapping['turbo'];
    console.log('🤖 Using model:', selectedModel);

    const blob = await Promise.race([
      hf.textToImage({
        model: selectedModel,
        inputs: prompt,
        parameters: {
          width: Math.min(width, 768),
          height: Math.min(height, 768),
          num_inference_steps: model === 'turbo' ? 4 : 25,
          guidance_scale: model === 'turbo' ? 0 : 7.5
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), 60000)
      )
    ]);

    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const imageUrl = `data:image/png;base64,${base64Image}`;

    console.log('✅ Image generated successfully!');

    return {
      imageUrl,
      prompt,
      model: selectedModel,
      seed,
      width: Math.min(width, 768),
      height: Math.min(height, 768),
      source: 'huggingface-free',
      format: 'base64'
    };

  } catch (error) {
    console.error('❌ Image generation error:', error.message);
    
    if (error.message === 'timeout') {
      throw new Error('Image generation timed out. Model may be loading. Try again in 30-60 seconds.');
    }
    
    if (error.response?.status === 503) {
      throw new Error('Model is loading. Please wait 30-60 seconds and try again (cold start).');
    }
    
    throw new Error(`Image generation failed: ${error.message}`);
  }
};

// ============================================
// IMAGE TO IMAGE - FIXED VERSION
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

    // Convert base64 to Blob
    let imageBlob;
    try {
      let base64Data = sourceImageBase64;
      
      // Handle data URL format
      if (sourceImageBase64.includes('data:image')) {
        base64Data = sourceImageBase64.split(',')[1];
      }
      
      // Remove any whitespace
      base64Data = base64Data.replace(/\s/g, '');
      
      const binaryData = Buffer.from(base64Data, 'base64');
      imageBlob = new Blob([binaryData], { type: 'image/png' });
      
      console.log('✅ Image blob created:', imageBlob.size, 'bytes');
    } catch (blobError) {
      console.error('❌ Blob creation failed:', blobError);
      throw new Error('Invalid image data format. Please provide valid base64 image.');
    }

    // Try image-to-image first
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
      
      // Fallback to text-to-image
      const fallbackResult = await exports.generateImage(enhancedPrompt, { 
        width, 
        height, 
        model: 'turbo', 
        seed 
      });
      
      return {
        ...fallbackResult,
        artStyle,
        strength,
        transformationType: 'text-to-image-fallback',
        fallbackReason: img2imgError.message,
        note: 'Used text-to-image as fallback due to image-to-image limitations'
      };
    }

  } catch (error) {
    console.error('❌ Image-to-image transformation error:', error);
    
    if (error.message.includes('timeout')) {
      throw new Error('Image transformation timed out. Model may be loading. Try again in 60 seconds.');
    }
    
    if (error.message.includes('Invalid image')) {
      throw new Error('Invalid source image. Please provide a valid base64 encoded image.');
    }
    
    throw new Error(`Image transformation failed: ${error.message}`);
  }
};

// Helper function for creating game asset prompts
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