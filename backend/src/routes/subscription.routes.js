const router = require('express').Router();
const {
  getSubscriptionStatus,
  cancelSubscription,
  getPaymentHistory,
} = require('../controllers/subscription.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/status', getSubscriptionStatus);
router.post('/cancel', cancelSubscription);
router.get('/payments', getPaymentHistory);

module.exports = router;
