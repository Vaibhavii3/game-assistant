const axios = require("axios");

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

Make it creative, balanced, and game-ready!`,

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

Make it immersive and fun!`,

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
        {"text": "Player option 2", "response": "NPC response to option 2"},
        {"text": "Player option 3", "response": "NPC response to option 3"}
      ]
    }
  ],
  "questHint": "Optional quest hint if relevant",
  "personality": "NPC personality description"
}

Make it engaging with meaningful choices!`,

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
    {"name": "POI 1", "description": "What's special here"},
    {"name": "POI 2", "description": "What's special here"}
  ],
  "resources": ["resource 1", "resource 2"],
  "dangers": ["danger 1", "danger 2"],
  "lore": "Historical background",
  "climate": "Weather and environment",
  "economy": "What drives this place"
}

Make it immersive and detailed!`,

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
    {"name": "ability 1", "damage": "number", "cooldown": "seconds"},
    {"name": "ability 2", "damage": "number", "cooldown": "seconds"}
  ],
  "weaknesses": ["weakness 1", "weakness 2"],
  "resistances": ["resistance 1", "resistance 2"],
  "loot": {
    "common": ["item 1", "item 2"],
    "rare": ["rare item 1"],
    "gold": "50-200"
  },
  "behavior": "How it fights",
  "location": "Where it's found"
}

Balance it for engaging combat!`,

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

Make it unique and desirable!`,

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
    },
    {
      "option": "Player choice 2", 
      "consequence": "What happens",
      "emotionalImpact": "How it affects story"
    }
  ],
  "mood": "Tone of this moment",
  "foreshadowing": "Hints about future events"
}

Return ONLY the JSON object, no markdown code blocks or extra formatting.`
};

exports.callGemini = async (promptText, type = 'text') => {
  const API_KEY = process.env.API_KEY;
  
  if (!API_KEY) {
    throw new Error('API_KEY not found in environment variables');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

  // Use structured prompt if type is specified
  const enhancedPrompt = GAME_PROMPTS[type] 
    ? GAME_PROMPTS[type](promptText)
    : promptText;

  try {
    const response = await axios.post(url, {
      contents: [
        {
          role: "user",
          parts: [{ text: enhancedPrompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    if (GAME_PROMPTS[type]) {
      try {
        let cleanedText = generatedText.trim();

        cleanedText = cleanedText.replace(/^```json\s*/i, '');
        cleanedText = cleanedText.replace(/^```\s*/i, '');
        cleanedText = cleanedText.replace(/\s*```$/i, '');
        
        cleanedText = cleanedText.trim();
        
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanedText = jsonMatch[0];
        }

        const parsed = JSON.parse(cleanedText);
        return parsed;
      } catch (parseError) {
        console.warn('Failed to parse JSON response:', parseError.message);
        console.log('Raw response:', generatedText);
        
        return {
          rawText: generatedText,
          error: 'Could not parse as JSON',
          note: 'Displaying raw content'
        };
      }
    }    
    return generatedText;
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    throw new Error(`Failed to call Gemini API: ${error.message}`);
  }
};

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