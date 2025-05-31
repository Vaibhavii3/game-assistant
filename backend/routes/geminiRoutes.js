const express = require('express');
const { handlePrompt, createCharacter, generateDialogue, createImage } = require('../controllers/geminiController');

const router = express.Router();

router.post('/generate', handlePrompt);
router.post('/character', createCharacter);
router.post('/dialogue', generateDialogue);
router.post('/image', createImage)

module.exports = router;
