/**
 * Applique db/schema.sql sur la base pointée par DATABASE_URL.
 * Usage : npm run db:migrate   (lit .env.local / .env si présents)
 */
import { existsSync, readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file);
}

// Migrations : connexion directe (non poolée), comme le recommande Neon.
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.error('❌ DATABASE_URL manquant. Lance d’abord : neon env pull');
  process.exit(1);
}

const sql = neon(url);
const statements = readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8')
  .split(/;\s*$/m)
  .map((s) => s.replace(/^\s*--.*$/gm, '').trim())
  .filter(Boolean);

for (const statement of statements) {
  await sql.query(statement);
}
console.log(`✅ Schéma appliqué (${statements.length} instructions).`);
