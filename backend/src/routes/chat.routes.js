const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

// Optionally, you could add an authentication middleware here if you wanted 
// to restrict the chatbot to logged-in users only. For now, it's public.
router.post('/', chatController.handleChat);

module.exports = router;
