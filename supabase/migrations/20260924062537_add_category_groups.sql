create table public.category_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  type text not null default 'expense' check (type in ('income', 'expense')),
  icon text not null default 'folder',
  is_hidden boolean not null default false,
  color text not null default '#4A5FD1',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, id)
);

alter table public.categories
  add column type text not null default 'expense',
  add column group_id uuid,
  add column sort_order integer not null default 0,
  add column is_system boolean not null default false;

alter table public.categories
  add constraint categories_type_check check (type in ('income', 'expense')),
  add constraint categories_group_owner_fkey
    foreign key (user_id, group_id)
    references public.category_groups(user_id, id)
    on delete set null (group_id);

create index categories_user_id_idx on public.categories(user_id);
create index categories_group_id_idx on public.categories(group_id);

drop trigger if exists update_category_groups_updated_at on public.category_groups;
create trigger update_category_groups_updated_at
  before update on public.category_groups
  for each row execute function public.update_updated_at();

alter table public.category_groups enable row level security;

revoke all on table public.category_groups from anon, authenticated;
grant select, insert, update, delete on table public.category_groups to authenticated;

create policy "Users can view own category groups"
  on public.category_groups for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own category groups"
  on public.category_groups for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own category groups"
  on public.category_groups for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own category groups"
  on public.category_groups for delete
  to authenticated
  using ((select auth.uid()) = user_id);
