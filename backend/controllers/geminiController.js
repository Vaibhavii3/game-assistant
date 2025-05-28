const { callGemini } = require('../services/geminiService')
const Prompt = require('../models/propmtModel')

exports.handlePrompt = async (req, res) => {
  const { prompt, type } = req.body;

  try {
    const response = await callGemini(prompt);
    const saved = await Prompt.create({ prompt, response, type });

    res.json({ response, savedId: saved._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
};
