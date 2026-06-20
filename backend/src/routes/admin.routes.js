const router = require('express').Router();
const {
  getStats,
  getUsers,
  updateUser,
  getUserScores,
  adminUpdateScore,
  getAdminCharities,
  createCharity,
  updateCharity,
  deleteCharity,
} = require('../controllers/admin.controller');
const { adminAuth } = require('../middleware/adminAuth');

router.use(adminAuth);

// Stats
router.get('/stats', getStats);

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/users/:id/scores', getUserScores);
router.put('/scores/:id', adminUpdateScore);

// Charity management
router.get('/charities', getAdminCharities);
router.post('/charities', createCharity);
router.put('/charities/:id', updateCharity);
router.delete('/charities/:id', deleteCharity);

module.exports = router;
