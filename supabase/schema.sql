-- ============================================================
-- Invest-Trade-Drive — canonical schema
-- Run in: Supabase Dashboard → SQL Editor
-- Idempotent: safe to re-run during development.
-- ============================================================

-- 1) Wipe conflicting tables (dev only — remove these DROPs in production)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS investment_plans CASCADE;
DROP TABLE IF EXISTS crypto_wallets CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS market_data CASCADE;
DROP TABLE IF EXISTS market_tickers CASCADE;  -- legacy name from the old repo schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2) Tables -------------------------------------------------------

CREATE TABLE crypto_wallets (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_crypto NUMERIC NOT NULL DEFAULT 0.00,
  balance_fiat   NUMERIC NOT NULL DEFAULT 0.00,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TABLE investment_plans (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name  VARCHAR(255) NOT NULL,
  amount     NUMERIC NOT NULL,
  status     VARCHAR(50) NOT NULL DEFAULT 'active'
             CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vin              VARCHAR(17) NOT NULL UNIQUE,
  model            VARCHAR(100) NOT NULL,
  price            NUMERIC NOT NULL,                 -- <-- the column that was missing before
  image_url        TEXT,
  inventory_status VARCHAR(50) NOT NULL DEFAULT 'available'
                   CHECK (inventory_status IN ('available', 'sold')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE market_data (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol         VARCHAR(20) NOT NULL UNIQUE,
  price          NUMERIC NOT NULL,
  change_percent NUMERIC,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id   UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  total_amount NUMERIC NOT NULL,
  status       VARCHAR(50) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) Row-Level Security ------------------------------------------

ALTER TABLE crypto_wallets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;

-- Wallets: owner only
CREATE POLICY wallets_select ON crypto_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY wallets_insert ON crypto_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY wallets_update ON crypto_wallets FOR UPDATE USING (auth.uid() = user_id);

-- Plans: owner only (full CRUD)
CREATE POLICY plans_select ON investment_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY plans_insert ON investment_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plans_update ON investment_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plans_delete ON investment_plans FOR DELETE USING (auth.uid() = user_id);

-- Vehicles & market data: public read (writes go through the service-role cron worker)
CREATE POLICY vehicles_select ON vehicles    FOR SELECT USING (true);
CREATE POLICY market_select   ON market_data FOR SELECT USING (true);

-- Orders: owner can read + create
CREATE POLICY orders_select ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4) Seed data ----------------------------------------------------

INSERT INTO vehicles (vin, model, price, image_url, inventory_status) VALUES
  ('5YJ3E1EA1KF123456', 'Tesla Model 3 Long Range', 47990,
   'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1600', 'available'),
  ('5YJXCDE26MF123457', 'Tesla Model X Plaid', 108990,
   'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1600', 'available')
ON CONFLICT (vin) DO NOTHING;

-- Placeholder rows the cron worker overwrites within 5 minutes of deploy.
INSERT INTO market_data (symbol, price, change_percent) VALUES
  ('BTC', 0, 0), ('ETH', 0, 0), ('TSLA', 0, 0)
ON CONFLICT (symbol) DO NOTHING;
