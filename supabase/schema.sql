-- 1) Wipe conflicting tables (safe for a fresh dev project)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS investment_plans CASCADE;
DROP TABLE IF EXISTS crypto_wallets CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS market_data CASCADE;
DROP TABLE IF EXISTS market_tickers CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2) Canonical tables
CREATE TABLE crypto_wallets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  balance_crypto NUMERIC DEFAULT 0.00,
  balance_fiat NUMERIC DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE investment_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_name VARCHAR(255) NOT NULL,
  amount NUMERIC NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active','cancelled','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vehicles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vin VARCHAR(17) UNIQUE NOT NULL,
  model VARCHAR(100) NOT NULL,
  price NUMERIC NOT NULL,
  image_url TEXT,
  inventory_status VARCHAR(50) DEFAULT 'available' CHECK (inventory_status IN ('available','sold')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE market_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  symbol VARCHAR(20) UNIQUE NOT NULL,
  price NUMERIC NOT NULL,
  change_percent NUMERIC,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  total_amount NUMERIC NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending','completed','cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) RLS
ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY wallets_select ON crypto_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY wallets_insert ON crypto_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY wallets_update ON crypto_wallets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY plans_select ON investment_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY plans_insert ON investment_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plans_update ON investment_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plans_delete ON investment_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY vehicles_select ON vehicles FOR SELECT USING (true);
CREATE POLICY market_select  ON market_data FOR SELECT USING (true);

CREATE POLICY orders_select ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4) Seed
INSERT INTO vehicles (vin, model, price, image_url, inventory_status) VALUES
  ('5YJ3E1EA1KF123456','Tesla Model 3 Long Range',47990,'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1600','available'),
  ('5YJXCDE26MF123457','Tesla Model X Plaid',108990,'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1600','available')
ON CONFLICT (vin) DO NOTHING;

INSERT INTO market_data (symbol, price, change_percent) VALUES
  ('BTC',0,0),('ETH',0,0),('TSLA',0,0)
ON CONFLICT (symbol) DO NOTHING;
