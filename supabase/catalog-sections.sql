create table if not exists public.catalog_sections (
  id text primary key,
  title text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.catalog_sections (id, title, display_order)
values
  ('singles', 'Single Products', 1),
  ('combos', 'Special Combo Offers', 2)
on conflict (id) do nothing;

alter table public.products
  add column if not exists section_id text;

update public.products
set section_id = case when type = 'combo' then 'combos' else 'singles' end
where section_id is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_section_id_fkey'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_section_id_fkey
      foreign key (section_id)
      references public.catalog_sections (id)
      on update cascade
      on delete restrict;
  end if;
end;
$$;

create index if not exists products_section_order_idx
  on public.products (section_id, display_order);

alter table public.catalog_sections enable row level security;
grant select on public.catalog_sections to anon, authenticated;
grant insert, update on public.catalog_sections to authenticated;

drop policy if exists "Active catalog sections are readable by everyone" on public.catalog_sections;
create policy "Active catalog sections are readable by everyone"
  on public.catalog_sections for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "Petify admins can view all catalog sections" on public.catalog_sections;
create policy "Petify admins can view all catalog sections"
  on public.catalog_sections for select
  to authenticated
  using (public.is_petify_admin());

drop policy if exists "Petify admins can insert catalog sections" on public.catalog_sections;
create policy "Petify admins can insert catalog sections"
  on public.catalog_sections for insert
  to authenticated
  with check (public.is_petify_admin());

drop policy if exists "Petify admins can update catalog sections" on public.catalog_sections;
create policy "Petify admins can update catalog sections"
  on public.catalog_sections for update
  to authenticated
  using (public.is_petify_admin())
  with check (public.is_petify_admin());

grant delete on public.catalog_sections to authenticated;

drop policy if exists "Petify admins can delete empty catalog sections" on public.catalog_sections;
create policy "Petify admins can delete empty catalog sections"
  on public.catalog_sections for delete
  to authenticated
  using (public.is_petify_admin());

create table if not exists public.site_settings (
  id text primary key check (id = 'storefront'),
  logo_url text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id)
values ('storefront')
on conflict (id) do nothing;

alter table public.site_settings enable row level security;
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;

drop policy if exists "Store logo is readable by everyone" on public.site_settings;
create policy "Store logo is readable by everyone"
  on public.site_settings for select
  to anon, authenticated
  using (id = 'storefront');

drop policy if exists "Petify admins can update store logo" on public.site_settings;
create policy "Petify admins can update store logo"
  on public.site_settings for update
  to authenticated
  using (public.is_petify_admin())
  with check (public.is_petify_admin());