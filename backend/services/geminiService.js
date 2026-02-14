const axios = require("axios");

// ============================================
// GAME CONTENT PROMPTS
// ============================================
const GAME_PROMPTS = {
  character: (userPrompt) => `
You are a professional game designer. Create a detailed game character based on this request: "${userPrompt}"

Return a JSON object with this EXACT structure:
{
  "name": "Character name",
  "class": "Character class/type",
  "backstory": "Detailed 3-4 sentence backstory",
  "personality": "Personality traits and quirks",
  "abilities": ["ability1", "ability2", "ability3"],
  "stats": {
    "health": 100,
    "strength": 0-100,
    "intelligence": 0-100,
    "agility": 0-100,
    "charisma": 0-100
  },
  "equipment": ["item1", "item2"],
  "weaknesses": "Character weaknesses",
  "motivation": "What drives this character"
}

Return ONLY the JSON object, no markdown code blocks or extra text.`,

  quest: (userPrompt) => `
You are a professional quest designer. Create an engaging game quest based on: "${userPrompt}"

Return a JSON object with this EXACT structure:
{
  "title": "Quest name",
  "type": "main/side/daily",
  "difficulty": "easy/medium/hard/expert",
  "description": "Engaging quest description",
  "objectives": [
    {"task": "objective 1", "completed": false},
    {"task": "objective 2", "completed": false}
  ],
  "rewards": {
    "experience": 100-1000,
    "gold": 50-500,
    "items": ["reward item 1", "reward item 2"]
  },
  "npc": {
    "name": "Quest giver name",
    "location": "Where to find them",
    "dialogue": "What they say when giving quest"
  },
  "story": "Deeper narrative context",
  "tips": ["hint 1", "hint 2"]
}

Return ONLY the JSON object, no markdown code blocks or extra text.`,

  dialogue: (userPrompt) => `
You are a professional game writer. Create natural NPC dialogue for: "${userPrompt}"

Return a JSON object with this EXACT structure:
{
  "npcName": "NPC name",
  "npcRole": "Role/occupation",
  "mood": "happy/sad/angry/neutral/mysterious",
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
}

Return ONLY the JSON object, no markdown code blocks or extra text.`,

  worldBuilding: (userPrompt) => `
You are a professional world builder. Create a detailed game world/location based on: "${userPrompt}"

Return a JSON object with this EXACT structure:
{
  "name": "Location name",
  "type": "city/dungeon/forest/mountain/island/etc",
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
}

Return ONLY the JSON object, no markdown code blocks or extra text.`,

  enemy: (userPrompt) => `
You are a professional game designer. Create a balanced game enemy based on: "${userPrompt}"

Return a JSON object with this EXACT structure:
{
  "name": "Enemy name",
  "type": "beast/humanoid/undead/demon/etc",
  "level": 1-100,
  "description": "Visual and behavioral description",
  "stats": {
    "health": 50-5000,
    "attack": 10-200,
    "defense": 5-150,
    "speed": 5-100
  },
  "abilities": [
    {"name": "ability 1", "damage": "number", "cooldown": "seconds"}
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
}

Return ONLY the JSON object, no markdown code blocks or extra text.`,

  item: (userPrompt) => `
You are a professional item designer. Create a game item based on: "${userPrompt}"

Return a JSON object with this EXACT structure:
{
  "name": "Item name",
  "type": "weapon/armor/consumable/quest/accessory",
  "rarity": "common/uncommon/rare/epic/legendary",
  "description": "Flavor text description",
  "stats": {
    "damage": "if weapon",
    "defense": "if armor",
    "bonus": "any stat bonuses"
  },
  "effects": ["effect 1", "effect 2"],
  "requirements": {
    "level": "required level",
    "class": "required class if any"
  },
  "value": "gold value",
  "weight": "item weight",
  "durability": "if applicable",
  "lore": "Item backstory",
  "obtainedFrom": "How to get this item"
}

Return ONLY the JSON object, no markdown code blocks or extra text.`,

  storyBeat: (userPrompt) => `
You are a professional narrative designer. Create a story moment based on: "${userPrompt}"

Return a JSON object with this EXACT structure:
{
  "title": "Story beat title",
  "chapter": "Which part of game",
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
  "mood": "Tone of this moment",
  "foreshadowing": "Hints about future events"
}

Return ONLY the JSON object, no markdown code blocks or extra text.`
};

// ============================================
// ✅ GROQ API - FREE & WORKS IN INDIA! 🇮🇳
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
      try {
        let cleanedText = generatedText.trim();
        
        // Remove markdown code blocks
        cleanedText = cleanedText.replace(/^```json\s*/i, '');
        cleanedText = cleanedText.replace(/^```\s*/i, '');
        cleanedText = cleanedText.replace(/\s*```$/i, '');
        cleanedText = cleanedText.trim();
        
        // Extract JSON object
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedText = jsonMatch[0];
        }

        const parsed = JSON.parse(cleanedText);
        
        console.log('✅ Successfully parsed JSON');
        return parsed;

      } catch (parseError) {
        console.warn('⚠️ Could not parse JSON, returning raw text');
        
        return {
          rawText: generatedText,
          error: 'Could not parse as JSON',
          note: 'Displaying raw content - AI may have generated text instead of JSON',
          type: type
        };
      }
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

    const hf = new HfInference(HF_KEY);

    const modelMapping = {
      'turbo': 'stabilityai/sdxl-turbo',
      'flux': 'black-forest-labs/FLUX.1-schnell',
      'sd': 'runwayml/stable-diffusion-v1-5'
    };

    const selectedModel = modelMapping[model] || modelMapping['turbo'];

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

    console.log('✅ Image generated!');

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
    console.error('❌ Image error:', error.message);
    throw new Error(`Image generation failed: ${error.message}`);
  }
};

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

    const hf = new HfInference(HF_KEY);

    const styleEnhancers = {
      '2d': 'professional 2D game art, hand-painted style',
      '3d': '3D rendered game asset, realistic lighting',
      'anime': 'anime game art style, cel-shaded',
      'pixel': 'pixel art game sprite, retro gaming',
      'realistic': 'photorealistic game graphics'
    };

    const enhancedPrompt = `${prompt}, ${styleEnhancers[artStyle] || styleEnhancers['2d']}, high quality`;

    let imageBlob;
    if (sourceImageBase64.startsWith('data:image')) {
      const base64Data = sourceImageBase64.split(',')[1];
      const binaryData = Buffer.from(base64Data, 'base64');
      imageBlob = new Blob([binaryData]);
    } else {
      imageBlob = new Blob([Buffer.from(sourceImageBase64, 'base64')]);
    }

    try {
      const blob = await Promise.race([
        hf.imageToImage({
          model: 'timbrooks/instruct-pix2pix',
          inputs: imageBlob,
          parameters: {
            prompt: enhancedPrompt,
            negative_prompt: 'blurry, low quality',
            num_inference_steps: 25,
            guidance_scale: 7.5,
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
        transformationType: 'image-to-image'
      };

    } catch (apiError) {
      console.log('⚠️ Falling back to text-to-image...');
      return await exports.generateImage(enhancedPrompt, { width, height, model: 'turbo', seed });
    }

  } catch (error) {
    console.error('❌ Image-to-image error:', error.message);
    throw error;
  }
};

exports.createGameAssetPrompt = (type, userDescription, style = '2d') => {
  const templates = {
    character: {
      '2d': `${userDescription}, professional 2D game character art`,
      '3d': `${userDescription}, 3D game character model`,
      'anime': `${userDescription}, anime game character art`,
      'pixel': `${userDescription}, pixel art character sprite`
    },
    scene: {
      '2d': `${userDescription}, 2D game environment art`,
      '3d': `${userDescription}, 3D game environment`,
      'realistic': `${userDescription}, photorealistic game environment`
    },
    item: {
      '2d': `${userDescription}, game item icon`,
      '3d': `${userDescription}, 3D game item render`,
      'pixel': `${userDescription}, pixel art item icon`
    },
    enemy: {
      '2d': `${userDescription}, 2D game enemy design`,
      '3d': `${userDescription}, 3D game enemy model`
    }
  };

  return templates[type]?.[style] || `${userDescription}, professional game art`;
};