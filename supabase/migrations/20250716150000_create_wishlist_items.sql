create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  is_done boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.wishlist_items enable row level security;

create policy "authenticated users only" on public.wishlist_items
  for all to authenticated using (true) with check (true);

grant select, insert, update, delete on public.wishlist_items to anon, authenticated, service_role;

drop trigger if exists set_updated_at on public.wishlist_items;
create trigger set_updated_at before update on public.wishlist_items
  for each row execute function public.set_updated_at();
