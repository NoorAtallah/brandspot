-- brand.spot — initial schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).
-- Safe to re-run: every object is created with IF NOT EXISTS / OR REPLACE.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- helpers
-- ─────────────────────────────────────────────────────────────

-- Every table carries updated_at; one trigger function serves them all.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- profiles — one row per auth user; is_admin gates the dashboard
-- ─────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- A profile row is created automatically for every new auth user, with
-- is_admin false. You flip the flag by hand for your own account:
--   update public.profiles set is_admin = true where email = 'you@example.com';
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- SECURITY DEFINER so the check itself is not subject to RLS on profiles,
-- which would otherwise recurse when a policy calls this function.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- catalogue
-- ─────────────────────────────────────────────────────────────

do $$ begin
  create type public.dept as enum ('women', 'men', 'kids');
exception when duplicate_object then null; end $$;

create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,              -- wordmark, e.g. ZARA
  name_ar     text,                       -- transliteration, e.g. زارا
  note_ar     text,                       -- "نساء · رجال · أطفال"
  note_en     text,
  logo_url    text,
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name_ar     text not null,
  name_en     text not null,
  dept        public.dept,                -- null = spans every department
  image_url   text,
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name_ar       text not null,
  name_en       text not null,
  description_ar text,
  description_en text,
  brand_id      uuid references public.brands (id) on delete set null,
  category_id   uuid references public.categories (id) on delete set null,
  dept          public.dept not null,
  price         numeric(10,2) not null check (price >= 0),
  was_price     numeric(10,2) check (was_price is null or was_price >= price),
  stock         int not null default 0 check (stock >= 0),
  is_new        boolean not null default true,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists products_dept_idx     on public.products (dept)        where active;
create index if not exists products_brand_idx    on public.products (brand_id);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_created_idx  on public.products (created_at desc);

-- Sizes a product is available in, so the cart can carry a size.
create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  size        text not null,              -- "S", "38", "4-5Y"
  stock       int not null default 0 check (stock >= 0),
  sort_order  int not null default 0,
  unique (product_id, size)
);

-- Images live in their own table so the admin can reorder them; position 0
-- is the card image.
create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images (product_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- looks — the shop-the-look outfits and their hotspots
-- ─────────────────────────────────────────────────────────────

create table if not exists public.looks (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  title_ar    text not null,
  title_en    text not null,
  image_url   text,
  sort_order  int not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- x/y are percentages of the frame, measured from the inline start, which is
-- what lets the pins mirror correctly in Arabic.
create table if not exists public.look_items (
  id          uuid primary key default gen_random_uuid(),
  look_id     uuid not null references public.looks (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete cascade,
  x           numeric(5,2) not null default 50 check (x between 0 and 100),
  y           numeric(5,2) not null default 50 check (y between 0 and 100),
  sort_order  int not null default 0,
  unique (look_id, product_id)
);

create index if not exists look_items_look_idx on public.look_items (look_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- orders — cash on delivery, no customer accounts
-- ─────────────────────────────────────────────────────────────

do $$ begin
  create type public.order_status as enum ('new', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned');
exception when duplicate_object then null; end $$;

create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    int not null unique default nextval('public.order_number_seq'),
  status          public.order_status not null default 'new',
  customer_name   text not null,
  phone           text not null,
  city            text not null,
  address         text not null,
  notes           text,
  subtotal        numeric(10,2) not null default 0,
  delivery_fee    numeric(10,2) not null default 0,
  total           numeric(10,2) not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists orders_status_idx  on public.orders (status, created_at desc);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- Name and price are copied in, so an order still reads correctly after the
-- product is renamed, repriced or deleted.
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_name  text not null,
  brand_name    text,
  size          text,
  unit_price    numeric(10,2) not null check (unit_price >= 0),
  quantity      int not null default 1 check (quantity > 0),
  image_url     text
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- Delivery fee per city, so checkout can price the drop.
create table if not exists public.delivery_zones (
  id          uuid primary key default gen_random_uuid(),
  city_ar     text not null,
  city_en     text not null,
  fee         numeric(10,2) not null default 0 check (fee >= 0),
  eta_ar      text,                        -- "خلال ٢٤ ساعة"
  eta_en      text,                        -- "within 24 hours"
  sort_order  int not null default 0,
  active      boolean not null default true
);

-- ─────────────────────────────────────────────────────────────
-- updated_at triggers
-- ─────────────────────────────────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array['profiles','brands','categories','products','looks','orders']
  loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s', t);
    execute format(
      'create trigger touch_%1$s before update on public.%1$s
       for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────
-- row level security
--
-- Shape: the storefront reads active rows anonymously; every write, and
-- everything to do with orders, requires an admin profile.
-- ─────────────────────────────────────────────────────────────

alter table public.profiles        enable row level security;
alter table public.brands          enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images  enable row level security;
alter table public.looks           enable row level security;
alter table public.look_items      enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.delivery_zones  enable row level security;

-- profiles: you can read your own row; admins can read and edit all.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- catalogue: public reads what is live, admin does everything.
do $$
declare t text;
begin
  foreach t in array array['brands','categories','products','looks','delivery_zones']
  loop
    execute format('drop policy if exists %1$s_public_read on public.%1$s', t);
    execute format(
      'create policy %1$s_public_read on public.%1$s
       for select using (active or public.is_admin())', t);

    execute format('drop policy if exists %1$s_admin_write on public.%1$s', t);
    execute format(
      'create policy %1$s_admin_write on public.%1$s
       for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- child rows: visible when their parent is.
drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read on public.product_images
  for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin()))
  );

drop policy if exists product_images_admin_write on public.product_images;
create policy product_images_admin_write on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists product_variants_public_read on public.product_variants;
create policy product_variants_public_read on public.product_variants
  for select using (
    exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin()))
  );

drop policy if exists product_variants_admin_write on public.product_variants;
create policy product_variants_admin_write on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists look_items_public_read on public.look_items;
create policy look_items_public_read on public.look_items
  for select using (
    exists (select 1 from public.looks l where l.id = look_id and (l.active or public.is_admin()))
  );

drop policy if exists look_items_admin_write on public.look_items;
create policy look_items_admin_write on public.look_items
  for all using (public.is_admin()) with check (public.is_admin());

-- orders: nobody reads them but an admin. Checkout inserts server-side with
-- the secret key, which bypasses RLS, so there is no public insert policy
-- here on purpose — it would let anyone write junk orders straight from the
-- browser.
drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists order_items_admin_all on public.order_items;
create policy order_items_admin_all on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- storage: one public bucket for product and look imagery
-- ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists media_admin_write on storage.objects;
create policy media_admin_write on storage.objects
  for all using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- seed: the delivery zones the checkout starts with
-- ─────────────────────────────────────────────────────────────

insert into public.delivery_zones (city_ar, city_en, fee, eta_ar, eta_en, sort_order)
values
  ('عمّان',    'Amman',   2.00, 'خلال ٢٤ ساعة',  'Within 24 hours', 1),
  ('الزرقاء',  'Zarqa',   2.50, '١–٢ يوم عمل',   '1–2 working days', 2),
  ('إربد',     'Irbid',   3.00, '٢–٣ أيام عمل',  '2–3 working days', 3),
  ('السلط',    'Salt',    3.00, '٢–٣ أيام عمل',  '2–3 working days', 4),
  ('مادبا',    'Madaba',  3.00, '٢–٣ أيام عمل',  '2–3 working days', 5),
  ('العقبة',   'Aqaba',   4.00, '٢–٣ أيام عمل',  '2–3 working days', 6),
  ('الكرك',    'Karak',   4.00, '٢–٣ أيام عمل',  '2–3 working days', 7),
  ('المفرق',   'Mafraq',  4.00, '٢–٣ أيام عمل',  '2–3 working days', 8)
on conflict do nothing;
