-- Pulse Kids — schéma Postgres (Neon)
-- Idempotent : peut être rejoué sans risque (`npm run db:migrate`).
-- Aucune donnée personnelle n'est stockée : uniquement le contenu partagé et des compteurs techniques.

-- Édition du jour générée par l'IA, partagée par tous (1 appel Gemini maximum par jour).
create table if not exists daily_stories (
  day         date primary key,
  story       jsonb not null,
  source      text not null default 'ai',
  created_at  timestamptz not null default now()
);

-- Limitation de débit (fenêtre fixe) pour protéger l'API et le quota Gemini.
create table if not exists rate_limits (
  key           text primary key,
  count         integer not null,
  window_start  timestamptz not null
);
