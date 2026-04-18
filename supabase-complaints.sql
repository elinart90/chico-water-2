-- ============================================================
-- Chico Water — Complaints & Super-Admin Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add super_admin role to users table
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check
  check (role in ('customer','salesperson','admin','driver','super_admin'));

-- Complaints table
create table if not exists complaints (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique not null,
  submitted_by uuid references users(id) on delete set null,
  submitter_name text not null,
  submitter_email text not null,
  submitter_role text not null default 'customer',
  subject text not null,
  category text not null check (category in (
    'order_issue','delivery','product_quality','staff_behaviour',
    'payment','system_bug','billing','other'
  )),
  description text not null,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'open' check (status in ('open','in_progress','resolved','closed')),
  assigned_to uuid references users(id) on delete set null,
  resolution_note text,
  resolved_at timestamptz,
  resolved_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Activity logs table
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  user_name text,
  user_role text,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb,
  created_at timestamptz default now()
);

-- Permissions
alter table complaints disable row level security;
alter table activity_logs disable row level security;
grant all on complaints to anon, authenticated;
grant all on activity_logs to anon, authenticated;

-- Ticket number generator
create or replace function generate_ticket_number()
returns text as $$
declare num integer;
begin
  select coalesce(max(substring(ticket_number from 4)::integer), 0) + 1
  into num from complaints where ticket_number like 'TKT-%';
  return 'TKT-' || lpad(num::text, 5, '0');
end;
$$ language plpgsql;
