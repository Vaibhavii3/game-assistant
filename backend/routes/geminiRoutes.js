const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');

router.post('/prompt', geminiController.handlePrompt);

router.post('/character', geminiController.createCharacter);

router.post('/quest', geminiController.generateQuest);

router.post('/dialogue', geminiController.generateDialogue);

router.post('/world', geminiController.generateWorld);

router.post('/enemy', geminiController.generateEnemy);

router.post('/item', geminiController.generateItem);

router.post('/story', geminiController.generateStory);

router.post('/image', geminiController.generateImageFromText);

router.post('/image-to-image', geminiController.generateImageFromImageInput);

// ============ CONTENT MANAGEMENT ROUTES ============

router.get('/content', geminiController.getSavedContent);

// Get specific content by ID
router.get('/content/:id', geminiController.getContentById);

// Delete content
router.delete('/content/:id', geminiController.deleteContent);

// Get statistics
router.get('/stats', geminiController.getStats);

module.exports = router;