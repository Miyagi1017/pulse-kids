/**
 * Schémas zod partagés front/back.
 * Toute donnée qui entre (requête client, réponse de l'IA) est validée ici.
 */
import { z } from 'zod';

// Texte affiché à un enfant : longueur bornée, pas de balises HTML.
const kidText = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((s) => !/<[^>]+>/.test(s), 'balises interdites');

const emoji = z.string().trim().min(1).max(16);

export const vocabularyWordSchema = z.object({
  word: kidText(40),
  syllables: kidText(60),
  definition: kidText(240),
  emoji
});

const sceneSchema = z.object({
  id: z.string().max(40),
  title: kidText(80),
  narration: kidText(600),
  durationSeconds: z.number().int().min(5).max(60).catch(15),
  bgType: z.enum(['workshop', 'space', 'ocean', 'nature', 'windmills']).catch('nature'),
  character: z.object({
    name: kidText(40),
    avatar: emoji,
    mood: z.enum(['happy', 'thinking', 'proud', 'excited', 'sleepy']).catch('happy'),
    speech: kidText(200)
  }),
  interactiveHotspots: z
    .array(
      z.object({
        id: z.string().max(40),
        label: kidText(60),
        xPercent: z.number().min(5).max(95).catch(50),
        yPercent: z.number().min(5).max(95).catch(50),
        emoji,
        soundType: z.string().max(30).catch('pop'),
        reactionText: kidText(200)
      })
    )
    .max(6),
  keyWords: z.array(vocabularyWordSchema).max(4)
});

const quizSound = z.enum(['water-tap', 'wrench', 'tractor', 'bell', 'chime']);

export const storySchema = z.object({
  id: z.string().max(60),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tagline: kidText(120),
  topic: kidText(100),
  source: kidText(80),
  summary: kidText(400),
  cartoon: z.object({
    title: kidText(100),
    durationLabel: kidText(30),
    badgeLabel: kidText(40),
    heroName: kidText(60),
    heroDescription: kidText(240),
    scenes: z.array(sceneSchema).min(1).max(6)
  }),
  soundQuiz: z.object({
    title: kidText(80),
    question: kidText(200),
    soundToPlay: z.enum(['water-tap', 'tractor', 'wrench']).catch('water-tap'),
    options: z
      .array(
        z.object({
          id: z.string().max(40),
          label: kidText(60),
          hint: kidText(120),
          emoji,
          isCorrect: z.boolean(),
          soundType: quizSound.catch('chime')
        })
      )
      .min(2)
      .max(4)
      .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, 'une seule bonne réponse')
  }),
  animalDiscovery: z.object({
    title: kidText(100),
    subtitle: kidText(160),
    animals: z
      .array(
        z.object({
          id: z.string().max(40),
          name: kidText(40),
          soundText: kidText(60),
          emoji,
          soundType: z.enum(['cow', 'sheep', 'pig', 'chicken']).catch('cow')
        })
      )
      .min(2)
      .max(6)
  }),
  mysteryBubble: z.object({
    title: kidText(80),
    question: kidText(200),
    shortExplanation: kidText(400),
    detailedSecret: kidText(600),
    bubbleCount: z.number().int().min(2).max(8).catch(4)
  }),
  bedtimeTale: z.object({
    title: kidText(80),
    summary: kidText(240),
    nightTheme: kidText(80),
    taleText: kidText(1500)
  })
});

export type StoryInput = z.infer<typeof storySchema>;
