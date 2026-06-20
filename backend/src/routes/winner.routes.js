const router = require('express').Router();
const {
  getMyWinnings,
  uploadProof,
  getAllVerifications,
  reviewVerification,
  markPaid,
} = require('../controllers/winner.controller');
const { authenticate } = require('../middleware/auth');
const { adminAuth } = require('../middleware/adminAuth');
const upload = require('../middleware/upload');

// User routes
router.get('/my', authenticate, getMyWinnings);
router.post('/:id/upload-proof', authenticate, (req, res, next) => {
  req.uploadSubdir = 'proofs';
  next();
}, upload.single('proof'), uploadProof);

// Admin routes
router.get('/', adminAuth, getAllVerifications);
router.put('/:id/review', adminAuth, reviewVerification);
router.put('/:id/mark-paid', adminAuth, markPaid);

module.exports = router;
