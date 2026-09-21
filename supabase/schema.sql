  -- ==========================================================
  -- 0️⃣   Extensions (required for gen_random_uuid() etc.)
  -- ==========================================================
  -- pgcrypto provides gen_random_uuid() and other crypto functions
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- ---------------------------------------------------------
  -- 1️⃣   CREATE CORE TABLES (public read‑only for everyone)
  -- ---------------------------------------------------------
  -- ---- Vehicles ------------------------------------------------
  CREATE TABLE vehicles (
    id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    vin                text UNIQUE NOT NULL,
    model              text NOT NULL,
    trim               text,
    msrp_cents         bigint NOT NULL,
    features_json      jsonb,
    image_url          text,
    inventory_status   text NOT NULL DEFAULT 'available',
    created_at         timestamp DEFAULT now()
  );

  -- ---- Investment Plans -----------------------------------------
  CREATE TABLE investment_plans (
    id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name              text NOT NULL,
    goal              text,
    horizon_years     integer,
    risk_score        smallint,
    allocation_json   jsonb,
    target_amount_cents bigint,
    created_at        timestamp DEFAULT now(),
    status            text DEFAULT 'draft'   -- draft, funded, closed
  );

  -- ---- Crypto Wallets -------------------------------------------
  CREATE TABLE crypto_wallets (
    user_id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    address           text UNIQUE,
    balance_crypto    bigint DEFAULT 0,
    updated_at        timestamp DEFAULT now()
  );

  -- ---- Orders ---------------------------------------------------
  CREATE TABLE orders (
    id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_id        uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    selected_options  jsonb,
    financing_type    text,
    payment_method    text,               -- 'crypto' | 'fiat' | 'hybrid'
    status            text DEFAULT 'draft',
    created_at        timestamp DEFAULT now(),
    vin_issued        text
  );

  -- ---- Market Tickers -------------------------------------------
  CREATE TABLE market_tickers (
    symbol          text PRIMARY KEY,
    price_cents     bigint,
    change_pct      numeric,
    fetched_at      timestamp DEFAULT now()
  );

  -- ---------------------------------------------------------
  -- 2️⃣   ENABLE ROW‑LEVEL SECURITY (RLS) ON EACH TABLE
  -- ---------------------------------------------------------
  ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE investment_plans ENABLE ROW LEVEL SECURITY;
  ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE market_tickers ENABLE ROW LEVEL SECURITY;

  -- ---------------------------------------------------------
  -- 4️⃣   POLICY DEFINITIONS (who can read / insert / update / delete)
  -- ---------------------------------------------------------
  -- ---- Vehicles – read‑only for everyone
  CREATE POLICY "vehicles_select"
    ON vehicles FOR SELECT
    USING (true);

  -- ---- Investment Plans policies (user‑scoped)
  CREATE POLICY "investment_plans_select"
    ON investment_plans FOR SELECT
    USING (true);   -- you can tighten later

  CREATE POLICY "investment_plans_insert"
    ON investment_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "investment_plans_update"
    ON investment_plans FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "investment_plans_delete"
    ON investment_plans FOR DELETE
    USING (auth.uid() = user_id);

  -- ---- Crypto Wallets policies (user‑scoped)
  CREATE POLICY "crypto_wallets_select"
    ON crypto_wallets FOR SELECT
    USING (true);

  CREATE POLICY "crypto_wallets_insert"
    ON crypto_wallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "crypto_wallets_update"
    ON crypto_wallets FOR UPDATE
    USING (auth.uid() = user_id);

  -- ---- Orders policies (user‑scoped)
  CREATE POLICY "orders_select"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "orders_insert"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "orders_update"
    ON orders FOR UPDATE
    USING (auth.uid() = user_id);

  CREATE POLICY "orders_delete"
    ON orders FOR DELETE
    USING (auth.uid() = user_id);

  -- ---- Market Tickers – read‑only for everyone
  CREATE POLICY "market_tickers_select"
    ON market_tickers FOR SELECT
    USING (true);

