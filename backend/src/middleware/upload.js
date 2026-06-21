const multer = require('multer');
const path = require('path');
const fs = require('fs');

// On Vercel serverless, only /tmp is writable. Use /tmp/uploads in production.
const uploadDir = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads'
  : (process.env.UPLOAD_PATH || './uploads');

// Ensure uploads directory exists (safe: recursive creates intermediate dirs)
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn(`Warning: Could not create upload directory "${uploadDir}":`, err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = req.uploadSubdir || '';
    const dir = path.join(uploadDir, subdir);
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (err) {
      return cb(new Error(`Cannot create upload directory: ${err.message}`));
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) and PDFs are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

module.exports = upload;
