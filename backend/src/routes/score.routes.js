const router = require('express').Router();
const { getScores, addScore, updateScore, deleteScore } = require('../controllers/score.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getScores);
router.post('/', addScore);
router.put('/:id', updateScore);
router.delete('/:id', deleteScore);

module.exports = router;
