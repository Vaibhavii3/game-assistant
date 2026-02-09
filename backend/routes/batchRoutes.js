const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

// ============================================
// BATCH GENERATION ROUTES
// ============================================

/**
 * Generate multiple items of same type
 * POST /api/gemini/batch/generate
 * 
 * Example:
 * {
 *   "type": "character",
 *   "count": 5,
 *   "basePrompt": "Create a fire-based warrior",
 *   "variations": true
 * }
 */
router.post('/generate', batchController.batchGenerate);

/**
 * Generate complete game world (multiple types)
 * POST /api/gemini/batch/world
 * 
 * Example:
 * {
 *   "theme": "underwater kingdom",
 *   "characters": 5,
 *   "quests": 3,
 *   "enemies": 4,
 *   "items": 6,
 *   "locations": 2
 * }
 */
router.post('/world', batchController.batchGenerateWorld);

/**
 * Generate variations of existing content
 * POST /api/gemini/batch/variations
 * 
 * Example:
 * {
 *   "contentId": "507f1f77bcf86cd799439011",
 *   "count": 3,
 *   "variationType": "style"
 * }
 */
router.post('/variations', batchController.batchGenerateVariations);

/**
 * Batch image generation
 * POST /api/gemini/batch/images
 * 
 * Example:
 * {
 *   "prompts": [
 *     "Fire warrior character",
 *     "Ice mage character",
 *     "Forest archer character"
 *   ],
 *   "artStyle": "2d",
 *   "width": 1024,
 *   "height": 1024
 * }
 */
router.post('/images', batchController.batchGenerateImages);

module.exports = router;