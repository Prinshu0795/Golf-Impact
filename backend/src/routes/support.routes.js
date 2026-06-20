const router = require('express').Router();
const { createMessage, getMessages, resolveMessage } = require('../controllers/support.controller');
const { authenticate } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');

// Public — anyone can submit a support message
router.post('/message', createMessage);

// Admin only
router.get('/messages', adminAuth, getMessages);
router.put('/messages/:id/resolve', adminAuth, resolveMessage);

module.exports = router;
