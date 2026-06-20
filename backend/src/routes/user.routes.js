const router = require('express').Router();
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);
router.get('/profile', getProfile);
router.put('/profile', (req, res, next) => {
  req.uploadSubdir = 'avatars';
  next();
}, upload.single('avatar'), updateProfile);

module.exports = router;
