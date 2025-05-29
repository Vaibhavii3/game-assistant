const express = require('express');
const { handlePrompt, createCharacter } = require('../controllers/geminiController');

const router = express.Router();

router.post('/generate', handlePrompt);
router.post('/character', createCharacter);

module.exports = router;
