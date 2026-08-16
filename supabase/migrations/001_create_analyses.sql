-- Analysis history owned by Supabase Auth users.
create table if not exists public.analyses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    filename text not null,
    ats_score double precision not null default 0,
    keyword_match double precision not null default 0,
    missing_keywords jsonb not null default '[]'::jsonb,
    analysis_result jsonb not null,
    created_at timestamptz not null default now()
);

create index if not exists analyses_user_created_idx
    on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

grant select, insert, delete on public.analyses to authenticated;

drop policy if exists "Users can view their own analyses" on public.analyses;
create policy "Users can view their own analyses"
on public.analyses for select to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can create their own analyses" on public.analyses;
create policy "Users can create their own analyses"
on public.analyses for insert to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);

drop policy if exists "Users can delete their own analyses" on public.analyses;
create policy "Users can delete their own analyses"
on public.analyses for delete to authenticated
using (auth.uid() is not null and auth.uid() = user_id);
