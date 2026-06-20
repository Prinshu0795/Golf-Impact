const router = require('express').Router();
const { getCharities, getCharityById, selectCharity, getCategories } = require('../controllers/charity.controller');
const { authenticate } = require('../middleware/auth');

router.get('/', getCharities);
router.get('/categories', getCategories);
router.get('/:id', getCharityById);
router.put('/select', authenticate, selectCharity);

module.exports = router;
