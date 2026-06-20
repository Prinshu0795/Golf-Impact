# ⛳ Golf Impact

> Track Performance • Win Rewards • Support Charity

A premium full-stack web application where golfers track their scores, participate in monthly prize draws, and donate to charities they love.

![Golf Impact](https://img.shields.io/badge/Golf%20Impact-v1.0.0-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase)
![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?style=flat-square&logo=stripe)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account

### 1. Clone & Setup

```bash
# Backend
cd backend
cp .env.example .env
# Fill in your credentials in .env
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env
# Fill in your credentials in .env
npm install
npm run dev
```

### 2. Database Setup

1. Go to your [Supabase Dashboard](https://supabase.com)
2. Open **SQL Editor**
3. Run the contents of `backend/src/config/schema.sql`
4. This creates all tables, indexes, and seed data (including 5 charities)

### 3. Create Admin User

After running the schema, create an admin via Supabase SQL:

```sql
-- First create via the API (signup endpoint), then update role:
UPDATE users SET role = 'admin' WHERE email = 'admin@golfimpact.com';
```

Or use the test credentials below (after seeding).

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase (from your project settings > API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Stripe (from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Context API (Auth, Subscription, Toast) |
| Forms | React Hook Form |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Auth | JWT + bcryptjs + httpOnly cookies |
| Database | Supabase (PostgreSQL) |
| Payments | Stripe Subscriptions |
| File Upload | Multer |
| Deployment | Vercel (Frontend + Backend) |

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
```
POST /auth/signup       - Create account
POST /auth/login        - Login (sets JWT cookie + returns token)
POST /auth/logout       - Logout (clears cookie)
GET  /auth/me           - Get current user
PUT  /auth/change-password - Change password
```

### Scores
```
GET    /scores          - Get my scores (newest first, max 5)
POST   /scores          - Add score (1-45 range, unique date, replaces oldest if >5)
PUT    /scores/:id      - Update score
DELETE /scores/:id      - Delete score
```

### Subscriptions
```
GET  /subscriptions/status          - Get subscription status
POST /subscriptions/create-checkout - Create Stripe checkout session
POST /subscriptions/cancel          - Cancel (at period end)
POST /subscriptions/reactivate      - Reactivate cancelled subscription
GET  /subscriptions/payments        - Payment history
```

### Draws
```
GET  /draws                - List published draws
GET  /draws/:id            - Get draw details
GET  /draws/my/results     - My draw entries & results
POST /draws/simulate       - [Admin] Simulate draw
POST /draws/run            - [Admin] Run & save draw
POST /draws/:id/publish    - [Admin] Publish draw
```

### Charities
```
GET /charities             - List charities (search/filter)
GET /charities/categories  - Get categories
GET /charities/:id         - Charity profile
PUT /charities/select      - Select charity + set donation %
```

### Winners
```
GET  /winners/my                    - My winnings
POST /winners/:id/upload-proof      - Upload verification proof
GET  /winners                       - [Admin] All verifications
PUT  /winners/:id/review            - [Admin] Approve/reject
PUT  /winners/:id/mark-paid         - [Admin] Mark as paid
```

### Admin
```
GET  /admin/stats           - Dashboard stats
GET  /admin/users           - User list
PUT  /admin/users/:id       - Edit user
GET  /admin/users/:id/scores - User's scores
PUT  /admin/scores/:id      - Edit score
GET  /admin/charities       - All charities
POST /admin/charities       - Create charity
PUT  /admin/charities/:id   - Update charity
DELETE /admin/charities/:id - Deactivate charity
```

### Stripe Webhook
```
POST /payments/webhook      - Handle Stripe events (raw body)
```

---

## 🗄️ Database Schema

```
users               - User accounts (role: user|admin)
scores              - Golf scores (max 5 per user, range 1-45)
subscriptions       - Stripe subscriptions
draws               - Monthly draw records
draw_entries        - User entries per draw
charities           - Charity organizations
charity_events      - Events per charity
charity_donations   - Donation records
payments            - Payment history
winner_verifications - Winner proof & review
```

---

## ✨ Features

### 🔐 Authentication
- JWT in httpOnly cookies + localStorage fallback
- Role-based access (user / admin)
- Protected routes (frontend + backend)

### ⛳ Score System
- Max 5 scores stored per user
- Score range: 1–45
- Unique date per score
- Adding 6th replaces oldest
- Displayed newest first

### 🎲 Draw Engine
- **5 Match** → 40% prize pool
- **4 Match** → 35% prize pool
- **3 Match** → 25% prize pool
- **Random mode**: pure random numbers
- **Algorithmic mode**: weighted by score frequency
- Jackpot rollover when no winner

### 💚 Charity System
- Select charity at signup
- Minimum 10% donation from winnings
- Adjustable up to 100%
- Independent donations supported

### 🏆 Winner Verification
- Upload proof (image/PDF)
- Admin approve/reject with notes
- Mark as paid status

### 👑 Admin Panel
- Analytics dashboard
- User management
- Draw configuration & publishing
- Charity CRUD
- Winner verification workflow

---

## 🚀 Deployment (Vercel)

### Frontend
1. Connect `frontend/` folder to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

### Backend
1. Create a `vercel.json` in `backend/`:
```json
{
  "version": 2,
  "builds": [{ "src": "index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/index.js" }]
}
```
2. Connect `backend/` folder to Vercel
3. Add environment variables

### Stripe Webhook (Production)
1. In Stripe dashboard → Webhooks → Add endpoint
2. URL: `https://your-backend.vercel.app/api/payments/webhook`
3. Events: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.deleted`, `customer.subscription.updated`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Stripe Products Setup
1. In Stripe → Products → Create two products:
   - **Golf Impact Monthly** - $9.99/month recurring
   - **Golf Impact Yearly** - $89.99/year recurring
2. Copy Price IDs to `STRIPE_MONTHLY_PRICE_ID` / `STRIPE_YEARLY_PRICE_ID`

---

## 🧪 Test Credentials

After creating accounts via signup and updating roles in Supabase:

```
Admin:  admin@golfimpact.com / Admin@123
User:   user@golfimpact.com  / User@123
```

---

## 📁 Project Structure

```
Golf Impact/
├── backend/
│   ├── src/
│   │   ├── config/        # Supabase, Stripe, JWT, schema.sql
│   │   ├── controllers/   # auth, score, subscription, draw, charity, winner, admin, payment
│   │   ├── middleware/    # auth, adminAuth, errorHandler, upload
│   │   ├── routes/        # All route files
│   │   └── services/      # draw.service.js (draw engine)
│   ├── uploads/           # Uploaded files (created automatically)
│   ├── .env
│   └── index.js           # Express entry point
│
└── frontend/
    ├── src/
    │   ├── components/    # Navbar, Footer, UI components, RouteGuards
    │   ├── context/       # AuthContext, SubscriptionContext, ToastContext
    │   ├── layouts/       # MainLayout, DashboardLayout, AdminLayout
    │   ├── pages/
    │   │   ├── auth/      # LoginPage, SignupPage
    │   │   ├── dashboard/ # Dashboard, Scores, Subscription, Charity, Rewards, Profile
    │   │   └── admin/     # Dashboard, Users, Draw, Charities, Winners
    │   ├── services/      # api.js + index.js (all API calls)
    │   └── index.css      # Global design system
    ├── .env
    └── vite.config.js
```

---

## 📄 License

MIT © Golf Impact 2024
