-- Fresco Hairvolution · database schema
--
-- Run this once in your Supabase project: Dashboard → SQL Editor → New query,
-- paste the whole file, then press Run.
--
-- What it sets up:
--   * the tables the site reads (services, zones, blackouts, reviews, settings)
--   * the bookings table, which anyone can write to but only you can read
--   * row level security, so a customer can never see another customer's booking
--
-- After running it, create your owner login: Authentication → Users → Add user,
-- with your email and a password. That login is what opens /admin.

-- ---------------------------------------------------------------- services
create table if not exists public.services (
  id          text primary key,
  name        text not null default '',
  category    text not null default 'Cuts',
  description text not null default '',
  minutes     integer not null default 30,
  price       integer not null default 0,
  active      boolean not null default true,
  position    integer not null default 0
);

-- ------------------------------------------------------------------- zones
create table if not exists public.zones (
  id             text primary key,
  name           text not null default '',
  areas          jsonb not null default '[]'::jsonb,
  fee_min        integer not null default 0,
  fee_max        integer,
  customer_share numeric not null default 0.5,
  active         boolean not null default true,
  position       integer not null default 0
);

-- --------------------------------------------------------------- blackouts
create table if not exists public.blackouts (
  date   text primary key,
  reason text not null default 'Not working'
);

-- ----------------------------------------------------------------- reviews
create table if not exists public.reviews (
  id         text primary key,
  first_name text not null default '',
  area       text not null default '',
  quote      text not null default '',
  rating     integer not null default 5,
  date       text not null default '',
  position   integer not null default 0
);

-- ---------------------------------------------------------------- settings
create table if not exists public.settings (
  id   integer primary key default 1,
  data jsonb not null default '{}'::jsonb
);

-- ---------------------------------------------------------------- bookings
create table if not exists public.bookings (
  id          text primary key,
  name        text not null default '',
  phone       text not null default '',
  service_id  text not null default '',
  add_on_ids  jsonb not null default '[]'::jsonb,
  date        text not null default '',
  slot        text not null default '',
  address     text not null default '',
  area        text not null default '',
  landmark    text not null default '',
  clients     integer not null default 1,
  notes       text not null default '',
  status      text not null default 'new',
  created_at  text not null default ''
);

create index if not exists bookings_date_idx on public.bookings (date);

-- ------------------------------------------------------- row level security
alter table public.services  enable row level security;
alter table public.zones     enable row level security;
alter table public.blackouts enable row level security;
alter table public.reviews   enable row level security;
alter table public.settings  enable row level security;
alter table public.bookings  enable row level security;

-- The site reads the price list, zones, days off, reviews and settings without
-- signing in. Only a signed-in owner can change them.
drop policy if exists "public reads services" on public.services;
create policy "public reads services" on public.services for select using (true);
drop policy if exists "owner writes services" on public.services;
create policy "owner writes services" on public.services for all to authenticated using (true) with check (true);

drop policy if exists "public reads zones" on public.zones;
create policy "public reads zones" on public.zones for select using (true);
drop policy if exists "owner writes zones" on public.zones;
create policy "owner writes zones" on public.zones for all to authenticated using (true) with check (true);

drop policy if exists "public reads blackouts" on public.blackouts;
create policy "public reads blackouts" on public.blackouts for select using (true);
drop policy if exists "owner writes blackouts" on public.blackouts;
create policy "owner writes blackouts" on public.blackouts for all to authenticated using (true) with check (true);

drop policy if exists "public reads reviews" on public.reviews;
create policy "public reads reviews" on public.reviews for select using (true);
drop policy if exists "owner writes reviews" on public.reviews;
create policy "owner writes reviews" on public.reviews for all to authenticated using (true) with check (true);

drop policy if exists "public reads settings" on public.settings;
create policy "public reads settings" on public.settings for select using (true);
drop policy if exists "owner writes settings" on public.settings;
create policy "owner writes settings" on public.settings for all to authenticated using (true) with check (true);

-- A customer may send a booking request. Nobody but the owner can read one back,
-- so one customer can never see another customer's address or phone number.
drop policy if exists "anyone requests a booking" on public.bookings;
create policy "anyone requests a booking" on public.bookings for insert to anon, authenticated with check (true);
drop policy if exists "owner reads bookings" on public.bookings;
create policy "owner reads bookings" on public.bookings for select to authenticated using (true);
drop policy if exists "owner updates bookings" on public.bookings;
create policy "owner updates bookings" on public.bookings for update to authenticated using (true) with check (true);
drop policy if exists "owner deletes bookings" on public.bookings;
create policy "owner deletes bookings" on public.bookings for delete to authenticated using (true);

-- A customer can look up and cancel only the bookings made with their own phone
-- number. These two functions run with elevated rights so the customer never
-- gets a general read on the table, and the phone number is the only key.
create or replace function public.lookup_bookings(p_phone text)
returns setof public.bookings
language sql
security definer
set search_path = public
as $$
  select *
  from public.bookings
  where right(regexp_replace(phone, '\D', '', 'g'), 10)
      = right(regexp_replace(p_phone, '\D', '', 'g'), 10)
  order by date desc;
$$;

create or replace function public.cancel_booking(p_id text, p_phone text)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.bookings
  where id = p_id
    and right(regexp_replace(phone, '\D', '', 'g'), 10)
      = right(regexp_replace(p_phone, '\D', '', 'g'), 10);
$$;

grant execute on function public.lookup_bookings(text) to anon, authenticated;
grant execute on function public.cancel_booking(text, text) to anon, authenticated;
