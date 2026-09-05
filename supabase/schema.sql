-- PilotIQ SQCDME — schéma opérationnel à exécuter dans Supabase.
create extension if not exists pgcrypto;
create type sqcdme_axis as enum ('S','Q','C','D','M','E');
create type problem_status as enum ('nouveau','en cours','bloqué','à valider','clôturé');
create type action_status as enum ('À faire','En cours','Bloqué','Terminé');

create table users (id uuid primary key references auth.users on delete cascade, full_name text not null, role text not null default 'viewer');
create table lines (code text primary key, active boolean not null default true);
insert into lines(code) values ('ERCA1'),('ERCA2'),('ERCA4'),('ERCA5'),('ERCA6') on conflict do nothing;

create table problems (
  code text primary key, title text not null, line text not null references lines(code), axis sqcdme_axis not null,
  owner text not null, status problem_status not null default 'nouveau', opened_at date not null default current_date,
  due_date date not null, impact text not null default '', cause text not null default '', next_action text not null default '',
  updated_at timestamptz not null default now(), top3_rank smallint check(top3_rank between 1 and 3), comments jsonb not null default '[]'
);
create unique index problems_top3_rank on problems(top3_rank) where top3_rank is not null and status <> 'clôturé';
create table actions (
  id uuid primary key default gen_random_uuid(), title text not null, problem_code text references problems(code) on delete set null,
  line text not null references lines(code), owner text not null, status action_status not null default 'À faire',
  progress smallint not null default 0 check(progress between 0 and 100), due_date date not null,
  comments jsonb not null default '[]', updated_at timestamptz not null default now()
);
create table comments (id uuid primary key default gen_random_uuid(), problem_code text references problems(code) on delete cascade, action_id uuid references actions(id) on delete cascade, author_id uuid references users(id), body text not null, created_at timestamptz not null default now(), check(problem_code is not null or action_id is not null));
create table escalations (id uuid primary key default gen_random_uuid(), problem_code text not null references problems(code) on delete cascade, destination text not null, reason text not null, status text not null default 'ouverte', created_at timestamptz not null default now());
create table sqcdme_daily (id uuid primary key default gen_random_uuid(), day date not null, axis sqcdme_axis not null, line text not null references lines(code), status text not null check(status in ('vert','orange','rouge')), comment text not null default '', deviation text, owner text not null, kpi_value numeric, unique(day,axis,line));
create table line_performance (id uuid primary key default gen_random_uuid(), day date not null, line text not null references lines(code), trs numeric, availability numeric, performance numeric, quality numeric, stop_count int, stop_minutes int, scrap numeric, late_orders int, comment text not null default '', unique(day,line));
create table meetings (id uuid primary key default gen_random_uuid(), meeting_date date not null default current_date, facilitator text not null, decisions jsonb not null default '[]', report text, started_at timestamptz, ended_at timestamptz);

alter table problems enable row level security;
alter table actions enable row level security;
-- Le prototype n'a pas encore d'écran de connexion. Ces politiques permettent le rôle anon
-- avec la clé publique; remplacez-les par des politiques auth.uid() avant ouverture externe.
create policy "prototype problems read" on problems for select to anon using (true);
create policy "prototype problems write" on problems for all to anon using (true) with check (true);
create policy "prototype actions read" on actions for select to anon using (true);
create policy "prototype actions write" on actions for all to anon using (true) with check (true);
