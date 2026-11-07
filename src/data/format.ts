/** Formats compacts des contenus embarqués (lisibles, faciles à enrichir). */

export type TaleKind = 'conte' | 'soir';

export interface Tale {
  id: string;
  kind: TaleKind;
  emoji: string;
  title: string;
  pages: string[];
}

/** [emoji, titre, "page 1|page 2|…"] → Tale. Les ids restent stables (ordre de la liste). */
export function parseTales(kind: TaleKind, rows: [string, string, string][]): Tale[] {
  return rows.map(([emoji, title, text], i) => ({
    id: `${kind}-${String(i + 1).padStart(2, '0')}`,
    kind,
    emoji,
    title,
    pages: text.split('|').map((p) => p.trim()).filter(Boolean)
  }));
}

/** Insère le prénom (ou « petit curieux » si inconnu). */
export function personalize(text: string, name: string | null | undefined): string {
  return text.replaceAll('{p}', name?.trim() || 'petit curieux');
}
