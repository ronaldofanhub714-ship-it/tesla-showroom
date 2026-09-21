-- -----------------------------------------------------------
  -- 1️⃣   Enable Row‑Level Security on every table
  -- -----------------------------------------------------------
  alter table vehicles enable row level security;
  alter table investment_plans enable row level security;
  alter table crypto_wallets enable row level security;
  alter table orders enable row level security;
  alter table market_tickers enable row level security;

  -- -----------------------------------------------------------
  -- 2️⃣   Vehicles (static inventory)
  -- -----------------------------------------------------------
  create table vehicles (
    id            uuid primary key default gen_random_uuid(),
    vin           text unique not null,
    model         text not null,
    trim          text,
    msrp_cents    bigint not null,
    features_json jsonb,
    image_url     text,
    inventory_status text not null default 'available',
    created_at    timestamp default now()
  );

  -- -----------------------------------------------------------
  -- 3️⃣   Investment Plans (user‑funded EV‑themed plans)
  -- -----------------------------------------------------------
  create table investment_plans (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid references auth.users not null,
    name          text not null,
    goal          text,
    horizon_years integer,
    risk_score    smallint,
    allocation_json jsonb,
    target_amount_cents bigint,
    created_at    timestamp default now(),
    status        text default 'draft'   -- draft, funded, closed
  );

  -- -----------------------------------------------------------
  -- 4️⃣   Crypto Wallets (one per user – optional)
  -- -----------------------------------------------------------
  create table crypto_wallets (
    user_id       uuid primary key references auth.users,
    address       text unique,
    balance_crypto bigint default 0,
    updated_at    timestamp default now()
  );

  -- -----------------------------------------------------------
  -- 5️⃣   Orders (vehicle purchase)
  -- -----------------------------------------------------------
  create table orders (
    id            uuid primary key default gen_random_uuid(),
    user_id       uuid references auth.users not null,
    vehicle_id    uuid references vehicles not null,
    selected_options jsonb,
    financing_type text,
    payment_method text,          -- 'crypto', 'fiat', 'hybrid'
    status        text default 'draft',
    created_at    timestamp default now(),
    vin_issued    text                -- VIN issued by dealer after payment
  );

  -- -----------------------------------------------------------
  -- 6️⃣   Market Tickers (cached live data)
  -- -----------------------------------------------------------
  create table market_tickers (
    symbol        text primary key,
    price_cents   bigint,
    change_pct    numeric,
    fetched_at    timestamp default now()
  );

  ▎ RLS policies (run once after supabase db push)
  ▎ (copy‑paste the block below into the Supabase SQL editor)

  -- Investment plans – only own rows
  create policy "investment_plans_select"
    on investment_plans for select using (user_id = auth.uid());
  create policy "investment_plans_insert"
    on investment_plans for insert with check (user_id = auth.uid());
  create policy "investment_plans_update"
    on investment_plans for update using (user_id = auth.uid());
  create policy "investment_plans_delete"
    on investment_plans for delete using (user_id = auth.uid());

  -- Crypto wallets – same pattern
  create policy "crypto_wallets_select"
    on crypto_wallets for select using (user_id = auth.uid());
  create policy "crypto_wallets_insert"
    on crypto_wallets for insert with check (user_id = auth.uid());
  create policy "crypto_wallets_update"
    on crypto_wallets for update using (user_id = auth.uid());

  -- Orders
  create policy "orders_select"
    on orders for select using (user_id = auth.uid());
  create policy "orders_insert"
    on orders for insert with check (user_id = auth.uid());
  create policy "orders_update"
    on orders for update using (user_id = auth.uid());

  -- Vehicles – public read
  create policy "vehicles_select"
    on vehicles for select using (true);

  -- Market tickers – public read
  create policy "market_tickers_select"
    on market_tickers for select using (true);

  ---
