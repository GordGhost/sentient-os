-- ════════════════════════════════════════════════════════════════════════════
-- SENTIENT//OS — Skill Marketplace schema
-- Run in the Supabase SQL editor. Enums + 4 core tables + helpful indexes.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Enums ─────────────────────────────────────────────────────────────────────
do $$ begin
  create type skill_status   as enum ('draft','pending_review','published','rejected','archived');
exception when duplicate_object then null; end $$;

do $$ begin
  create type visibility_t    as enum ('public','private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type validation_t    as enum ('pending','passed','failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type safety_t        as enum ('safe','needs_manual_review','blocked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type install_status_t as enum
    ('not_installed','install_pending','installed','working','failed','outdated','needs_update');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status_t  as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

-- ── skills ────────────────────────────────────────────────────────────────────
create table if not exists skills (
  id                uuid primary key default gen_random_uuid(),
  creator_id        uuid,
  name              text not null,
  slug              text not null unique,
  description       text,
  category          text,
  tags              text[]      default '{}',
  status            skill_status default 'draft',
  visibility        visibility_t default 'public',
  compatible_agents text[]      default '{}',
  required_tools    text[]      default '{}',
  github_repo       text,
  github_branch     text        default 'main',
  github_pr_url     text,
  github_path       text,
  install_command   text,
  install_count     integer     default 0,
  last_verified_at  timestamptz,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- ── skill_versions ────────────────────────────────────────────────────────────
create table if not exists skill_versions (
  id                uuid primary key default gen_random_uuid(),
  skill_id          uuid references skills(id) on delete cascade,
  version           text not null,
  skill_md          text,
  manifest_json     jsonb,
  test_json         jsonb,
  references_json   jsonb,
  validation_status validation_t default 'pending',
  safety_status     safety_t     default 'safe',
  created_at        timestamptz default now(),
  unique (skill_id, version)
);

-- ── skill_installs ────────────────────────────────────────────────────────────
create table if not exists skill_installs (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid,
  skill_id             uuid references skills(id) on delete cascade,
  skill_version        text,
  install_status       install_status_t default 'not_installed',
  verification_code    text,
  verification_output  text,
  function_test_output text,
  agent_type           text,
  verified_at          timestamptz,
  last_checked_at      timestamptz,
  error_message        text
);

-- ── skill_reviews ─────────────────────────────────────────────────────────────
create table if not exists skill_reviews (
  id           uuid primary key default gen_random_uuid(),
  skill_id     uuid references skills(id) on delete cascade,
  reviewer_id  uuid,
  status       review_status_t default 'pending',
  notes        text,
  created_at   timestamptz default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists idx_skills_status    on skills(status);
create index if not exists idx_skills_category   on skills(category);
create index if not exists idx_skills_slug       on skills(slug);
create index if not exists idx_versions_skill    on skill_versions(skill_id);
create index if not exists idx_installs_skill    on skill_installs(skill_id);
create index if not exists idx_installs_user     on skill_installs(user_id);
create index if not exists idx_reviews_skill     on skill_reviews(skill_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────
create or replace function touch_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

drop trigger if exists trg_skills_touch on skills;
create trigger trg_skills_touch before update on skills
  for each row execute function touch_updated_at();
