-- Mobile Zone Supabase schema
-- Run in Supabase SQL Editor. Then create an Auth user in Authentication > Users
-- and insert that user's UUID into public.admin_users.
create extension if not exists pgcrypto;
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'Other',
  price numeric(12,2) not null check (price >= 0),
  old_price numeric(12,2),
  stock integer not null default 0 check (stock >= 0),
  badge text,
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  items jsonb not null default '[]'::jsonb,
  total numeric(12,2) not null default 0 check (total >= 0),
  note text,
  status text not null default 'new' check (status in ('new','confirmed','dispatched','completed','cancelled')),
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
create or replace function public.is_mobile_zone_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()); $$;
revoke all on function public.is_mobile_zone_admin() from public;
grant execute on function public.is_mobile_zone_admin() to authenticated;
drop policy if exists "admins read admin list" on public.admin_users;
create policy "admins read admin list" on public.admin_users for select to authenticated using (public.is_mobile_zone_admin());
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select to anon, authenticated using (true);
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products for all to authenticated using (public.is_mobile_zone_admin()) with check (public.is_mobile_zone_admin());
drop policy if exists "public create order requests" on public.orders;
create policy "public create order requests" on public.orders for insert to anon, authenticated with check (status='new');
drop policy if exists "admins read and manage orders" on public.orders;
create policy "admins read and manage orders" on public.orders for all to authenticated using (public.is_mobile_zone_admin()) with check (public.is_mobile_zone_admin());
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=true,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "public view product photos" on storage.objects;
create policy "public view product photos" on storage.objects for select to anon, authenticated using (bucket_id='product-images');
drop policy if exists "admins upload product photos" on storage.objects;
create policy "admins upload product photos" on storage.objects for insert to authenticated with check (bucket_id='product-images' and public.is_mobile_zone_admin());
drop policy if exists "admins update product photos" on storage.objects;
create policy "admins update product photos" on storage.objects for update to authenticated using (bucket_id='product-images' and public.is_mobile_zone_admin()) with check (bucket_id='product-images' and public.is_mobile_zone_admin());
drop policy if exists "admins delete product photos" on storage.objects;
create policy "admins delete product photos" on storage.objects for delete to authenticated using (bucket_id='product-images' and public.is_mobile_zone_admin());