create table if not exists public.products (
  id text primary key,
  type text not null check (type in ('single', 'combo')),
  badge text not null,
  title text not null,
  description text not null,
  specs jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  save_tag text,
  price text,
  old_price text,
  default_whatsapp_msg text not null,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Published products are readable by everyone"
  on public.products for select
  to anon, authenticated
  using (is_active = true);