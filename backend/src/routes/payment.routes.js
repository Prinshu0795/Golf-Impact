const router = require('express').Router();
const { createOrder, verifyPayment, handleWebhook } = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth');

// Razorpay webhook — raw body, no JWT auth
router.post('/webhook', handleWebhook);

// Protected payment routes
router.use(authenticate);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

module.exports = router;
