/**
 * Christine dit le prénom de l'enfant : une phrase avec {p} est enregistrée en morceaux autour du prénom
 * (clé = sentenceKey du morceau, comme toute phrase de la banque), et chaque prénom a sa prise
 * public/banque/prenom-<nameKey>.mp3 (prénoms les plus donnés en France, scripts/voix/names-lines.ts).
 * À la lecture, on enchaîne morceau, prénom, morceau. S'il manque une prise, on revient à la phrase
 * sans prénom : jamais deux voix dans la même réplique.
 */
import { keyFile, sentenceKey } from './bank';

/** Clé d'un prénom : minuscules, sans accents (« Léa-Rose » → « lea-rose »). */
export function nameKey(name: string): string {
  return name.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
}

export const nameFile = (name: string) => `prenom-${nameKey(name)}`;

/** Les morceaux de texte autour du gabarit {p}, sans la ponctuation qui touchait le prénom. */
export function splitAtName(template: string): string[] {
  return template
    .split('{p}')
    .map((s) =>
      s
        .trim()
        .replace(/^[,;:]\s*/, '')
        .trim()
    )
    .filter((s) => /[\p{L}\p{N}]/u.test(s));
}

/** Les clés (sentenceKey) des morceaux à enregistrer pour un texte avec prénom ; [] sans {p}. */
export function templateSegments(template: string): string[] {
  return template.includes('{p}')
    ? splitAtName(template)
        .map((s) => sentenceKey(s))
        .filter(Boolean)
    : [];
}

/** Morceau, prénom, morceau… pour un texte où le prénom est écrit ; null si rien à faire ou s'il manque une prise. */
export function namePlaylist(text: string, name: string | null | undefined, has: (file: string) => boolean): { file: string; text: string }[] | null {
  const n = name?.trim();
  if (!n || n.length < 2 || !text.includes(n)) return null;
  const out: { file: string; text: string }[] = [];
  text.split(n).forEach((piece, i) => {
    if (i > 0) out.push({ file: nameFile(n), text: n });
    const key = sentenceKey(piece);
    if (key) out.push({ file: keyFile(key), text: piece });
  });
  return out.every((p) => has(p.file)) ? out : null;
}
