/**
 * Illustrations des contes (générées par scripts/generate-illustrations.ts avec un modèle
 * open source Hugging Face). Vite ne fournit ici que les URL : chaque image n'est
 * téléchargée qu'au moment où elle s'affiche.
 */
const files = import.meta.glob<string>('../assets/illustrations/*.webp', { eager: true, query: '?url', import: 'default' });

const byId = new Map<string, string>(
  Object.entries(files).map(([file, url]) => [file.split('/').pop()!.replace('.webp', ''), url])
);

export function illustrationFor(id: string): string | undefined {
  return byId.get(id);
}

export const illustrationCount = byId.size;
