/**
 * Schémas zod partagés front/back : tout contenu qui vient d'un service externe
 * (IA, réponse d'API) est validé avant d'être montré à un enfant.
 */
import { z } from 'zod';

// Texte affiché à un enfant : longueur bornée, pas de balises HTML ni de liens.
export const kidText = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((s) => !/<[^>]+>/.test(s), 'balises interdites')
    .refine((s) => !/https?:\/\//i.test(s), 'liens interdits');

const emoji = z.string().trim().min(1).max(16);

export const sceneBgs = ['soleil', 'ciel', 'menthe', 'lavande', 'nuit', 'rose'] as const;

export const videoSceneSchema = z.object({
  emoji,
  text: kidText(260),
  bg: z.enum(sceneBgs).catch('ciel'),
  imageUrl: z.string().url().optional(),
  credit: z.string().max(140).optional()
});
export type VideoScene = z.infer<typeof videoSceneSchema>;

/** Ce que l'IA doit renvoyer : un thème du jour en 3 petites scènes. */
export const aiThemeSchema = z.object({
  theme: kidText(60),
  emoji,
  scenes: z.array(z.object({ emoji, text: kidText(220) })).min(2).max(4)
});
export type AiTheme = z.infer<typeof aiThemeSchema>;

/** Réponse de /api/today. Le prénom n'y figure jamais (placeholder « {p} », remplacé côté appareil). */
export const todaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: kidText(80),
  emoji,
  scenes: z.array(videoSceneSchema).min(2).max(12),
  sources: z.array(z.string().max(60)).max(8)
});
export type Today = z.infer<typeof todaySchema>;
