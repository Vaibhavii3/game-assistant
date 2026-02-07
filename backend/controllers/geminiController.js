const { callGemini } = require('../services/geminiService');
const Prompt = require('../models/propmtModel');

exports.handlePrompt = async (req, res) => {
  const { prompt, type } = req.body;

  try {
    const response = await callGemini(prompt, type || 'text');
    const saved = await Prompt.create({ 
      prompt, 
      response: JSON.stringify(response), 
      type: type || 'text' 
    });

    res.json({ response, savedId: saved._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
};

exports.createCharacter = async (req, res) => {
  const prompt = req.body.prompt || "Create a hero with powers, backstory, and personality";

  try {
    const response = await callGemini(prompt, 'character');
    const saved = await Prompt.create({ 
      prompt, 
      response: JSON.stringify(response), 
      type: 'character' 
    });

    res.json({ character: response, savedId: saved._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate character' });
  }
};

exports.generateDialogue = async (req, res) => {
  const prompt = req.body.prompt || "Create an NPC dialogue for a side quest";

  try {
    const response = await callGemini(prompt, 'dialogue');
    const saved = await Prompt.create({ 
      prompt, 
      response: JSON.stringify(response), 
      type: 'dialogue' 
    });

    res.json({ dialogue: response, savedId: saved._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate dialogue' });
  }
};

// Image generation function removed