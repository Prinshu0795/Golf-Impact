-- ============================================================
-- Golf Impact Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  charity_id UUID,
  donation_pct DECIMAL(5,2) DEFAULT 10.00 CHECK (donation_pct >= 10 AND donation_pct <= 100),
  avatar_url TEXT,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHARITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  image_url TEXT,
  banner_url TEXT,
  website VARCHAR(255),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  total_raised DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key for users.charity_id after charities table is created
ALTER TABLE users ADD CONSTRAINT fk_users_charity 
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL;

-- ============================================================
-- SCORES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, score_date)
);

-- Index for fast score lookups
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(score_date DESC);

-- ============================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'expired', 'cancelled', 'past_due')),
  -- Razorpay payment identifiers
  razorpay_order_id   VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature  VARCHAR(512),
  amount DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'INR',
  starts_at            TIMESTAMPTZ,
  expires_at           TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end   TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_order ON subscriptions(razorpay_order_id);

-- ============================================================
-- DRAWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_type VARCHAR(10) NOT NULL CHECK (draw_type IN ('3match', '4match', '5match')),
  mode VARCHAR(20) DEFAULT 'random' CHECK (mode IN ('random', 'algorithmic')),
  winning_numbers INTEGER[] NOT NULL,
  prize_pool DECIMAL(12,2) DEFAULT 0.00,
  jackpot_amount DECIMAL(12,2) DEFAULT 0.00,
  jackpot_rolled_over BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'simulated', 'published')),
  draw_date DATE NOT NULL,
  created_by UUID REFERENCES users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DRAW ENTRIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS draw_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  numbers_played INTEGER[] NOT NULL,
  matches INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_user_id ON draw_entries(user_id);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('subscription', 'prize_payout', 'charity_donation', 'independent_donation')),
  provider VARCHAR(50) DEFAULT 'razorpay',
  provider_order_id   VARCHAR(255),
  provider_payment_id VARCHAR(255),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order ON payments(provider_order_id);

-- ============================================================
-- PAYMENT EVENTS TABLE (Razorpay webhook log)
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_type ON payment_events(event_type);

-- ============================================================
-- WINNER VERIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS winner_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  draw_entry_id UUID REFERENCES draw_entries(id),
  prize_amount DECIMAL(12,2) NOT NULL,
  proof_url TEXT,
  proof_filename VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_winner_verifications_user_id ON winner_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_winner_verifications_status ON winner_verifications(status);

-- ============================================================
-- CHARITY DONATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS charity_donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID REFERENCES draws(id),
  charity_id UUID NOT NULL REFERENCES charities(id),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(30) DEFAULT 'draw_allocation' CHECK (type IN ('draw_allocation', 'prize_percentage', 'independent')),
  stripe_payment_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CHARITY EVENTS TABLE (for charity profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS charity_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON charities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_draws_updated_at BEFORE UPDATE ON draws FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_winner_verifications_updated_at BEFORE UPDATE ON winner_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA - Charities
-- ============================================================
INSERT INTO charities (name, description, short_description, category, is_active, is_featured) VALUES
('St. Jude Children''s Research Hospital', 'St. Jude Children''s Research Hospital is a nonprofit medical facility that treats children with cancer and other life-threatening diseases. Treatments developed here have helped push the overall childhood cancer survival rate from 20% to more than 80% since opening in 1962.', 'Helping children fight cancer and other life-threatening diseases.', 'Healthcare', true, true),
('American Red Cross', 'The American Red Cross prevents and alleviates human suffering in the face of emergencies by mobilizing the power of volunteers and the generosity of donors.', 'Providing emergency assistance, disaster relief, and education.', 'Humanitarian', true, false),
('Habitat for Humanity', 'Habitat for Humanity is a nonprofit housing organization working in local communities across all 50 states and in more than 70 countries around the world to build or improve homes for families in need.', 'Building affordable homes for families in need worldwide.', 'Housing', true, false),
('World Wildlife Fund', 'WWF works to sustain the natural world for the benefit of people and wildlife, collaborating with partners from local to global levels in nearly 100 countries.', 'Protecting wildlife and natural habitats worldwide.', 'Environment', true, false),
('Feeding America', 'Feeding America is the largest hunger-relief organization in the United States. Through a network of food banks, statewide food bank associations, and food pantries, we help provide food to millions of Americans.', 'Fighting hunger and food insecurity across America.', 'Food Security', true, false);

-- ============================================================
-- SEED DATA - Admin User (password: Admin@123)
-- ============================================================
-- Note: Replace password_hash with actual bcrypt hash
-- bcrypt hash for "Admin@123": $2a$10$... (generate with bcrypt)
-- Run this after your first server start or manually update

-- ============================================================
-- MIGRATION: Stripe ? Razorpay (Run for EXISTING databases)
-- ============================================================
-- Safe to run multiple times (IF NOT EXISTS guards)

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS razorpay_order_id   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS razorpay_signature  VARCHAR(512),
  ADD COLUMN IF NOT EXISTS currency            VARCHAR(10) DEFAULT 'INR',
  ADD COLUMN IF NOT EXISTS starts_at           TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at          TIMESTAMPTZ;

ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS provider            VARCHAR(50)  DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS provider_order_id   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS provider_payment_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_subscriptions_razorpay_order ON subscriptions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order      ON payments(provider_order_id);

CREATE TABLE IF NOT EXISTS payment_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(100) NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_type ON payment_events(event_type);

