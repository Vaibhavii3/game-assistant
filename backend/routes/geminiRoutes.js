const express = require('express');
const { handlePrompt } = require('../controllers/geminiController');

const router = express.Router();

router.post('/generate', handlePrompt);

module.exports = router;
