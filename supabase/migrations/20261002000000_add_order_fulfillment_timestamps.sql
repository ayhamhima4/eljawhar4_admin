alter table public.orders
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz;
