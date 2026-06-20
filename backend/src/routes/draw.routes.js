const router = require('express').Router();
const {
  getDraws,
  getDrawById,
  getMyDrawResults,
  simulateDraw,
  runDraw,
  publishDraw,
} = require('../controllers/draw.controller');
const { authenticate } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// Public
router.get('/', getDraws);
router.get('/:id', authenticate, getDrawById);

// Authenticated
router.get('/my/results', authenticate, getMyDrawResults);

// Admin only
router.post('/simulate', adminAuth, simulateDraw);
router.post('/run', adminAuth, runDraw);
router.post('/:id/publish', adminAuth, publishDraw);

module.exports = router;
