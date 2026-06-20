# Golf Impact — Production Deployment Guide (Razorpay)

## Overview

This guide covers the full production deployment of the Golf Impact application with Razorpay payment integration.

---

## 1. Razorpay Dashboard Setup

### Step 1 — Create Account
1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Complete KYC verification (required for live transactions)

### Step 2 — Generate API Keys
1. Go to **Settings → API Keys**
2. Click **Generate Key** under **Live Mode** (use Test Mode during development)
3. Copy **Key ID** (`rzp_live_xxxx`) and **Key Secret**

### Step 3 — Register Webhook
1. Go to **Settings → Webhooks → Add New Webhook**
2. Set Webhook URL: `https://your-backend.vercel.app/api/payments/webhook`
3. Set a strong **Secret** (save it as `RAZORPAY_WEBHOOK_SECRET`)
4. Enable these events:
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `subscription.charged`
   - ✅ `subscription.cancelled`
5. Click **Create Webhook**

---

## 2. Supabase Database Migration

Run this in your Supabase project **SQL Editor** (safe for existing data):

```sql
-- Add Razorpay columns to subscriptions
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS razorpay_order_id   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS razorpay_signature  VARCHAR(512),
  ADD COLUMN IF NOT EXISTS currency            VARCHAR(10) DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS starts_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at          TIMESTAMPTZ;

-- Add Razorpay columns to payments
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS provider            VARCHAR(50)  DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS provider_order_id   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS provider_payment_id VARCHAR(255);

-- Create payment_events table (webhook log)
CREATE TABLE IF NOT EXISTS payment_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_order ON subscriptions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order      ON payments(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_type          ON payment_events(event_type);
```

---

## 3. Backend Deployment (Vercel)

### Step 1 — Push to GitHub
```bash
git add .
git commit -m "chore: replace Stripe with Razorpay"
git push origin main
```

### Step 2 — Import to Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Set **Root Directory** to `backend`
4. Set **Framework Preset** to `Other`
5. Set **Build Command**: *(leave empty for Node.js)*
6. Set **Output Directory**: *(leave empty)*

### Step 3 — Create `vercel.json` in backend folder
```json
{
  "version": 2,
  "builds": [{ "src": "index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "index.js" }]
}
```

### Step 4 — Environment Variables (Backend)
Add these in Vercel project → **Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_ANON_KEY` | your anon key |
| `SUPABASE_SERVICE_KEY` | your service role key |
| `JWT_SECRET` | strong random 64-char string |
| `JWT_EXPIRES_IN` | `7d` |
| `RAZORPAY_KEY_ID` | `rzp_live_xxxx` |
| `RAZORPAY_SECRET` | your Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | webhook secret from dashboard |

---

## 4. Frontend Deployment (Vercel)

### Step 1 — Import Frontend
1. Create a new Vercel project for the `frontend` directory
2. Set **Root Directory** to `frontend`
3. Set **Framework Preset** to `Vite`

### Step 2 — Environment Variables (Frontend)
| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.vercel.app/api` |
| `VITE_RAZORPAY_KEY_ID` | `rzp_live_xxxx` |
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | your anon key |

### Step 3 — Update Backend CORS
After getting the frontend Vercel URL, update `FRONTEND_URL` in backend env to match exactly.

---

## 5. Payment Flow Architecture

```
User selects plan
       ↓
POST /api/payments/create-order
  → Razorpay creates order (amount, currency, receipt)
  → Backend stores pending payment in DB
       ↓
Frontend opens Razorpay Checkout popup (JS SDK)
  → User enters card/UPI/net banking details
  → Payment processed by Razorpay
       ↓
Razorpay returns {order_id, payment_id, signature} to frontend
       ↓
POST /api/payments/verify
  → HMAC-SHA256 signature verified server-side
  → Replay protection (payment_id uniqueness check)
  → Subscription activated in Supabase
  → Payment record updated to 'completed'
       ↓
Dashboard shows active subscription
       ↓
Razorpay sends webhook → POST /api/payments/webhook
  → Signature verified
  → Event logged to payment_events table
  → Subscription/payment records updated
```

---

## 6. Go-Live Checklist

### Razorpay
- [ ] KYC verification completed and approved
- [ ] Live API keys generated (not test keys)
- [ ] Webhook URL registered and verified
- [ ] All 4 webhook events enabled

### Backend
- [ ] `RAZORPAY_KEY_ID` set to live key (`rzp_live_...`)
- [ ] `RAZORPAY_SECRET` set to live secret
- [ ] `RAZORPAY_WEBHOOK_SECRET` matches Razorpay dashboard
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` is a strong production secret
- [ ] `FRONTEND_URL` points to production frontend URL

### Frontend
- [ ] `VITE_RAZORPAY_KEY_ID` set to live key
- [ ] `VITE_API_URL` points to production backend
- [ ] No `console.log` with sensitive data

### Database
- [ ] Migration SQL run on production Supabase
- [ ] `payment_events` table exists
- [ ] Razorpay columns added to `subscriptions` and `payments`

### Testing
- [ ] End-to-end payment flow tested with live card
- [ ] Failed payment recovery tested
- [ ] Webhook receiving and processing events
- [ ] Dashboard shows correct subscription status
- [ ] Cancellation flow working

---

## 7. Razorpay Test Cards (Development Only)

| Card Number | Network | Result |
|---|---|---|
| `4111 1111 1111 1111` | Visa | Success |
| `5267 3181 8797 5449` | Mastercard | Success |
| `4000 0000 0000 0002` | Visa | Failure |

Use CVV: `123`, Expiry: any future date

---

## 8. Support

- Razorpay Docs: [https://razorpay.com/docs](https://razorpay.com/docs)
- Razorpay Support: [https://dashboard.razorpay.com/support](https://dashboard.razorpay.com/support)
