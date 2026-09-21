// ── Database row types (mirror supabase/schema.sql) ───────────────

export type PlanStatus = 'active' | 'cancelled' | 'completed';
export type InventoryStatus = 'available' | 'sold';
export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface InvestmentPlan {
  id: string;
  user_id: string;
  plan_name: string;
  amount: number;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
}

export interface CryptoWallet {
  id: string;
  user_id: string;
  balance_crypto: number;
  balance_fiat: number;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  vin: string;
  model: string;
  price: number;
  image_url: string | null;
  inventory_status: InventoryStatus;
  created_at: string;
}

export interface MarketRow {
  id: string;
  symbol: string;
  price: number;
  change_percent: number | null;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  vehicle_id: string | null;
  total_amount: number;
  status: OrderStatus;
  created_at: string;
}

// ── API response envelopes ────────────────────────────────────────

export interface ApiError {
  error: string;
}

export type WalletBalance = Pick<CryptoWallet, 'balance_crypto' | 'balance_fiat'>;
