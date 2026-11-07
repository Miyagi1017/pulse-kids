-- Pulse Kids — schéma Postgres (Neon)
-- Idempotent : peut être rejoué sans risque (`npm run db:migrate`).
-- Aucune donnée personnelle n'est stockée : uniquement du contenu partagé et des compteurs techniques.

-- Contenu du jour partagé par tous : édition IA (`story:AAAA-MM-JJ`), photo NASA (`space:AAAA-MM-JJ`).
create table if not exists daily_cache (
  key         text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

-- Limitation de débit (fenêtre fixe) pour protéger l'API et les quotas des fournisseurs.
create table if not exists rate_limits (
  key           text primary key,
  count         integer not null,
  window_start  timestamptz not null
);

-- Ménage : l'ancienne table de cache (v2.0) est remplacée par daily_cache.
drop table if exists daily_stories;
