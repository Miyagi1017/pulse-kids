/**
 * Banque de voix : chaque phrase de l'app est enregistrée une fois, avec la voix de Christine
 * (OpenVoice V2, voir scripts/voix/). Le même découpage et la même clé servent à la génération
 * (scripts/voix/bank-lines.ts) et à la lecture (utils/soundEffects.ts) : une phrase dite à l'écran
 * retrouve toujours sa prise, même si elle est assemblée à la volée (« Titre. Page 1 »).
 */

/** Découpe un texte en phrases (après . ! ? … suivis d'un espace ; les guillemets restent avec leur phrase). */
export function splitSentences(text: string): string[] {
  const out: string[] = [];
  const re = /[^.!?…]+(?:[.!?…]+[»"”)]?|$)/g;
  for (const m of text.matchAll(re)) {
    const s = m[0].trim();
    if (s && /[\p{L}\p{N}]/u.test(s)) out.push(s);
  }
  return out;
}

/** Retire le prénom (le gabarit {p}, ou le prénom réel passé en paramètre) : il n'est pas enregistré. */
export function withoutName(s: string, name?: string | null): string {
  let t = s;
  if (name && name.trim().length > 1) t = t.split(name.trim()).join('{p}');
  return t
    .replace(/\s*\{p\}\s*([,!?.…])/g, '$1')
    .replace(/\{p\}/g, '')
    .replace(/,\s*([!?.…])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Clé d'une phrase : minuscules, sans ponctuation ni espaces superflus (« Partez ! » = « partez »). */
export function sentenceKey(s: string, name?: string | null): string {
  return withoutName(s, name)
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^\p{L}\p{N}' ]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Nom de fichier court et stable d'une clé (FNV-1a 32 bits, en base 36). */
export function keyFile(key: string): string {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36).padStart(7, '0');
}

/** Phrase affichée : le gabarit {p} devient le prénom, ou disparaît proprement s'il n'y en a pas (« Et toi, tu… »). */
export function cleanName(s: string, name?: string | null): string {
  const n = name?.trim();
  if (n) return s.split('{p}').join(n);
  return s
    .replace(/\s*\{p\}\s*([,.])/g, '$1')
    .replace(/\s*\{p\}\s*([!?…:;])/g, ' $1')
    .replace(/\{p\}/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
