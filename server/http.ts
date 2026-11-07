import { z } from 'zod';

/** Erreur HTTP « attendue » : son message est renvoyé tel quel au client. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public headers: Record<string, string> = {}
  ) {
    super(message);
  }
}

const BASE_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  for (const [k, v] of Object.entries(BASE_HEADERS)) if (!headers.has(k)) headers.set(k, v);
  return new Response(JSON.stringify(data), { ...init, headers });
}

const MAX_BODY_BYTES = 16 * 1024;

/** Lit et valide un corps JSON (taille bornée, schéma zod strict). */
export async function readBody<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  const type = req.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) throw new HttpError(415, 'Content-Type application/json attendu.');
  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, 'Requête trop volumineuse.');
  let raw: unknown;
  try {
    raw = JSON.parse(text || '{}');
  } catch {
    throw new HttpError(400, 'JSON invalide.');
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new HttpError(400, `Données invalides${first?.path.length ? ` (${first.path.join('.')})` : ''} : ${first?.message ?? 'format incorrect'}.`);
  }
  return parsed.data;
}

/**
 * Protection CSRF : les requêtes qui modifient l'état doivent venir de notre propre origine.
 * (Complète SameSite=Lax sur le cookie de session.)
 */
export function assertSameOrigin(req: Request) {
  if (req.method === 'GET' || req.method === 'HEAD') return;
  const origin = req.headers.get('origin');
  if (!origin) return; // clients non-navigateur (curl, tests) : pas de cookie tiers en jeu
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
  try {
    if (new URL(origin).host === host) return;
  } catch {
    /* origine malformée */
  }
  throw new HttpError(403, 'Origine non autorisée.');
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'local').trim();
}

type Handler = (req: Request) => Promise<Response>;

/** Enveloppe chaque route : CSRF, erreurs uniformes, aucune fuite de stack trace. */
export function route(handler: Handler): Handler {
  return async (req) => {
    try {
      assertSameOrigin(req);
      return await handler(req);
    } catch (err) {
      if (err instanceof HttpError) {
        return json({ error: err.message }, { status: err.status, headers: err.headers });
      }
      console.error('[api] erreur inattendue', err);
      return json({ error: 'Erreur interne. Réessaie dans un instant.' }, { status: 500 });
    }
  };
}
