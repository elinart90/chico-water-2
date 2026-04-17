-- ============================================================
-- Chico Water Limited — Full Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Users table (custom auth — no Supabase Auth)
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  password_hash text not null,
  role text not null default 'customer' check (role in ('customer','salesperson','admin','driver')),
  segment text check (segment in ('household','retail','wholesale','corporate')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text not null check (category in ('bottled','sachet','empty_bottle')),
  size text,
  unit text default 'unit',
  price_household numeric(10,2) not null,
  price_retail numeric(10,2) not null,
  price_wholesale numeric(10,2) not null,
  price_corporate numeric(10,2) not null,
  stock integer default 0,
  image_url text,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid references users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  segment text not null check (segment in ('household','retail','wholesale','corporate')),
  items jsonb not null default '[]',
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) default 15,
  total numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','confirmed','packed','in_transit','delivered','cancelled')),
  payment_method text not null check (payment_method in ('momo','card','cash')),
  payment_status text default 'pending' check (payment_status in ('pending','paid')),
  delivery_address text not null,
  delivery_region text not null,
  delivery_notes text,
  preferred_date date,
  salesperson_id uuid references users(id) on delete set null,
  driver_id uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Settings
create table if not exists settings (
  key text primary key,
  value text not null,
  label text not null,
  description text,
  category text not null,
  type text not null default 'text' check (type in ('text','number','boolean','select','textarea','color','time','email','phone','url')),
  options text,
  is_public boolean default false,
  updated_at timestamptz default now()
);

-- Inventory log
create table if not exists inventory_log (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  change_amount integer not null,
  reason text,
  order_id uuid references orders(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================================
-- DISABLE RLS (enable and add policies when ready for production)
-- ============================================================
alter table users disable row level security;
alter table products disable row level security;
alter table orders disable row level security;
alter table settings disable row level security;
alter table inventory_log disable row level security;

-- Grant full access to anon and authenticated roles
grant all on users to anon, authenticated;
grant all on products to anon, authenticated;
grant all on orders to anon, authenticated;
grant all on settings to anon, authenticated;
grant all on inventory_log to anon, authenticated;

-- ============================================================
-- STOCK DECREMENT FUNCTION
-- ============================================================
create or replace function decrement_stock(p_product_id uuid, p_quantity integer)
returns void as $$
begin
  update products set stock = greatest(0, stock - p_quantity), updated_at = now()
  where id = p_product_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- SEED PRODUCTS
-- ============================================================
insert into products (name, description, category, size, unit, price_household, price_retail, price_wholesale, price_corporate, stock) values
  ('500ml Bottled Water', 'Pure, refreshing 500ml bottled water — perfect for on-the-go.', 'bottled', '500ml', 'bottle', 2.50, 2.20, 1.80, 1.90, 5000),
  ('1L Bottled Water', 'Premium 1-litre bottled water for home and office.', 'bottled', '1L', 'bottle', 4.50, 4.00, 3.20, 3.50, 3000),
  ('1.5L Bottled Water', 'Family-sized 1.5L pure water bottle.', 'bottled', '1.5L', 'bottle', 6.00, 5.40, 4.50, 4.80, 2000),
  ('Sachet Water (Bag)', '30 sachets of pure 500ml water per bag.', 'sachet', '500ml x 30', 'bag', 8.00, 7.00, 5.50, 6.00, 8000),
  ('Sachet Water (Crate)', '12 bags per crate — ideal for wholesale buyers.', 'sachet', '30-sachet bags x 12', 'crate', 90.00, 80.00, 62.00, 68.00, 400),
  ('Empty 500ml Bottles', 'Premium empty 500ml PET bottles, food-grade.', 'empty_bottle', '500ml', 'pack of 24', 18.00, 15.00, 12.00, 13.00, 10000),
  ('Empty 1L Bottles', 'Durable 1-litre empty PET bottles.', 'empty_bottle', '1L', 'pack of 12', 20.00, 17.00, 14.00, 15.50, 6000)
on conflict do nothing;
