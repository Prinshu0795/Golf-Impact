# ⛳ Golf Impact-- https://golf-impact-idxt.vercel.app/

> Track Performance • Win Rewards • Support Charity

A premium full-stack web application where golfers track their scores, participate in monthly prize draws, and donate to charities they love.

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

MIT © Golf Impact 2026
