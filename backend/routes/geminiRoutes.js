const express = require('express');
const { handlePrompt, createCharacter, generateDialogue } = require('../controllers/geminiController');

const router = express.Router();

router.post('/generate', handlePrompt);
router.post('/character', createCharacter);
router.post('/dialogue', generateDialogue);
// Image route removed

module.exports = router;