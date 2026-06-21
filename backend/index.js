require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const scoreRoutes = require('./src/routes/score.routes');
const subscriptionRoutes = require('./src/routes/subscription.routes');
const drawRoutes = require('./src/routes/draw.routes');
const charityRoutes = require('./src/routes/charity.routes');
const winnerRoutes = require('./src/routes/winner.routes');
const adminRoutes = require('./src/routes/admin.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const supportRoutes = require('./src/routes/support.routes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

const app = express();

// ─── CORS ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── RAZORPAY WEBHOOK (raw body BEFORE json parser) ─────────────────────
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./src/controllers/payment.controller').handleWebhook);

// ─── BODY PARSERS ────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── STATIC FILES ────────────────────────────────────────────────────────
const uploadsPath = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads'
  : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));


// ─── HEALTH CHECK ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Golf Impact API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── ROUTES ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/support', supportRoutes);

// ─── ERROR HANDLING ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── START SERVER ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🏌️  Golf Impact API Server`);
  console.log(`✅  Running on http://localhost:${PORT}`);
  console.log(`🌐  Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
