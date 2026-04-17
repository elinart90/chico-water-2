-- ============================================================
-- Chico Water — Supply Chain Schema
-- Run this in Supabase SQL Editor AFTER supabase-schema.sql
-- ============================================================

-- ============================================================
-- SUPPLIERS
-- ============================================================
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  phone text,
  email text,
  address text,
  region text,
  category text not null check (category in ('water_source','bottles','packaging','chemicals','equipment','other')),
  notes text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PURCHASE REQUESTS (approval workflow)
-- ============================================================
create table if not exists purchase_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text unique not null,
  requested_by uuid references users(id) on delete set null,
  requester_name text not null,
  supplier_id uuid references suppliers(id) on delete set null,
  supplier_name text,
  items jsonb not null default '[]',
  -- items format: [{ name, quantity, unit, unit_cost, total_cost }]
  total_cost numeric(12,2) not null,
  reason text not null,
  urgency text not null default 'normal' check (urgency in ('low','normal','high','urgent')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','purchased','cancelled')),
  approved_by uuid references users(id) on delete set null,
  approver_name text,
  approval_note text,
  approved_at timestamptz,
  purchased_at timestamptz,
  attachment_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PRODUCTION LOGS
-- ============================================================
create table if not exists production_logs (
  id uuid primary key default gen_random_uuid(),
  log_date date not null default current_date,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity_produced integer not null,
  batch_number text,
  notes text,
  logged_by uuid references users(id) on delete set null,
  logger_name text,
  approved boolean default false,
  approved_by uuid references users(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================================
-- WASTAGE LOGS
-- ============================================================
create table if not exists wastage_logs (
  id uuid primary key default gen_random_uuid(),
  log_date date not null default current_date,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null,
  reason text not null check (reason in ('damaged','expired','spilled','contaminated','other')),
  notes text,
  cost_impact numeric(10,2) default 0,
  logged_by uuid references users(id) on delete set null,
  logger_name text,
  created_at timestamptz default now()
);

-- ============================================================
-- COST OF GOODS (add cost price to products)
-- ============================================================
alter table products
  add column if not exists cost_price numeric(10,2) default 0,
  add column if not exists low_stock_threshold integer default 100,
  add column if not exists reorder_quantity integer default 500,
  add column if not exists preferred_supplier_id uuid references suppliers(id) on delete set null;

-- ============================================================
-- DELIVERY ROUTES (route optimization)
-- ============================================================
create table if not exists delivery_routes (
  id uuid primary key default gen_random_uuid(),
  route_date date not null default current_date,
  driver_id uuid references users(id) on delete set null,
  driver_name text,
  region text not null,
  order_ids jsonb not null default '[]',
  status text not null default 'planned' check (status in ('planned','in_progress','completed')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- STOCK REORDER ALERTS (view)
-- ============================================================
create or replace view low_stock_products as
  select
    p.id,
    p.name,
    p.category,
    p.stock,
    p.low_stock_threshold,
    p.reorder_quantity,
    s.name as supplier_name,
    s.phone as supplier_phone,
    case
      when p.stock = 0 then 'out_of_stock'
      when p.stock <= p.low_stock_threshold then 'low'
      else 'ok'
    end as stock_status
  from products p
  left join suppliers s on s.id = p.preferred_supplier_id
  where p.active = true
  order by p.stock asc;

-- ============================================================
-- PROFIT MARGINS (view)
-- ============================================================
create or replace view product_margins as
  select
    id,
    name,
    category,
    size,
    unit,
    cost_price,
    price_household,
    price_retail,
    price_wholesale,
    price_corporate,
    round(price_wholesale - cost_price, 2) as wholesale_margin,
    round(price_retail - cost_price, 2) as retail_margin,
    case
      when cost_price > 0
      then round(((price_wholesale - cost_price) / cost_price) * 100, 1)
      else 0
    end as wholesale_margin_pct,
    case
      when cost_price > 0
      then round(((price_retail - cost_price) / cost_price) * 100, 1)
      else 0
    end as retail_margin_pct
  from products
  where active = true
  order by name;

-- ============================================================
-- PERMISSIONS
-- ============================================================
grant all on suppliers to anon, authenticated;
grant all on purchase_requests to anon, authenticated;
grant all on production_logs to anon, authenticated;
grant all on wastage_logs to anon, authenticated;
grant all on delivery_routes to anon, authenticated;
grant select on low_stock_products to anon, authenticated;
grant select on product_margins to anon, authenticated;

alter table suppliers disable row level security;
alter table purchase_requests disable row level security;
alter table production_logs disable row level security;
alter table wastage_logs disable row level security;
alter table delivery_routes disable row level security;

-- ============================================================
-- PURCHASE REQUEST NUMBER GENERATOR
-- ============================================================
create or replace function generate_pr_number()
returns text as $$
declare
  num integer;
begin
  select coalesce(max(substring(request_number from 4)::integer), 0) + 1
  into num
  from purchase_requests
  where request_number like 'PR-%';
  return 'PR-' || lpad(num::text, 5, '0');
end;
$$ language plpgsql;

-- ============================================================
-- SEED SAMPLE SUPPLIERS
-- ============================================================
insert into suppliers (name, contact_name, phone, email, address, region, category, notes) values
  ('Ghana Water Company', 'Kwame Asante', '+233302123456', 'supply@gwcl.com.gh', 'Kpeshie, Accra', 'Greater Accra', 'water_source', 'Primary raw water supplier'),
  ('Accra Packaging Ltd', 'Abena Mensah', '+233244567890', 'sales@accrapack.com', 'Spintex Road, Accra', 'Greater Accra', 'bottles', 'PET bottle supplier — 500ml and 1L'),
  ('Golden Seal Caps', 'Kofi Boateng', '+233277123456', 'info@goldenseal.gh', 'Tema Industrial Area', 'Greater Accra', 'packaging', 'Bottle caps and seals'),
  ('ChemPure Ghana', 'Ama Osei', '+233200987654', 'orders@chempure.gh', 'Kantamanto, Accra', 'Greater Accra', 'chemicals', 'Water treatment chemicals')
on conflict do nothing;
