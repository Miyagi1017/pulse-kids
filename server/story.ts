import { GoogleGenAI } from '@google/genai';
import { storySchema, type StoryInput } from '../shared/schemas.js';
import { db, hasDatabase } from './db.js';

export function todayParis(): string {
  // Date « du jour » côté enfants français, indépendante du fuseau du serveur.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}

const memoryCache = new Map<string, StoryInput>();

function buildPrompt(day: string): string {
  return `Tu es le rédacteur en chef bienveillant de « PULSE KIDS », un journal animé quotidien pour enfants de 5 ans.
Conçois l'édition du ${day} autour d'une actualité POSITIVE et réelle (science, nature, espace, animaux, inventions, écologie).

Règles de sécurité absolues (public : 5 ans) :
- Aucune violence, peur, maladie, mort, guerre, politique, marque commerciale, ni personne réelle nommée.
- Phrases courtes, vocabulaire simple, ton joyeux et rassurant. Aucun lien, aucune balise HTML.
- Une seule option correcte dans le quiz.

Réponds UNIQUEMENT avec un objet JSON valide qui respecte exactement cette structure :
{
  "id": "story-ai-${day}",
  "date": "${day}",
  "tagline": "L'actualité magique du jour pour les p'tits curieux",
  "topic": "Titre court du thème",
  "source": "Journal des P'tits Curieux",
  "summary": "Résumé bienveillant en 2 phrases simples",
  "cartoon": {
    "title": "Titre joyeux du dessin animé",
    "durationLabel": "3 min chrono",
    "badgeLabel": "Activité 1 sur 5",
    "heroName": "Nom du héros (ex : Nino le Renardeau)",
    "heroDescription": "Description mignonne du personnage",
    "scenes": [
      {
        "id": "sc-1",
        "title": "Titre de la scène",
        "narration": "2-3 phrases lues à voix haute",
        "durationSeconds": 15,
        "bgType": "nature | space | ocean | workshop | windmills",
        "character": { "name": "Nino", "avatar": "🦊", "mood": "happy | thinking | proud | excited | sleepy", "speech": "Bonjour les amis !" },
        "interactiveHotspots": [
          { "id": "h-1", "label": "Objet", "xPercent": 30, "yPercent": 40, "emoji": "🌱", "soundType": "pop", "reactionText": "Réaction rigolote" }
        ],
        "keyWords": [
          { "word": "germe", "syllables": "ger - me", "definition": "Définition pour 5 ans", "emoji": "🌱" }
        ]
      }
    ]
  },
  "soundQuiz": {
    "title": "Le Quiz Sonore du Jour",
    "question": "Écoute bien et devine !",
    "soundToPlay": "water-tap | tractor | wrench",
    "options": [
      { "id": "opt-1", "label": "Option", "hint": "Indice", "emoji": "🚰", "isCorrect": true, "soundType": "water-tap" },
      { "id": "opt-2", "label": "Option", "hint": "Indice", "emoji": "🚜", "isCorrect": false, "soundType": "tractor" }
    ]
  },
  "animalDiscovery": {
    "title": "Touche un animal pour entendre son cri !",
    "subtitle": "Sous-titre",
    "animals": [ { "id": "an-1", "name": "La Vache", "soundText": "Meuhhh !", "emoji": "🐮", "soundType": "cow | sheep | pig | chicken" } ]
  },
  "mysteryBubble": {
    "title": "Le Grand Mystère du Jour",
    "question": "Question pourquoi ?",
    "shortExplanation": "Explication simple",
    "detailedSecret": "Détail passionnant",
    "bubbleCount": 4
  },
  "bedtimeTale": {
    "title": "Le Conte Étoilé du Soir",
    "summary": "Résumé doux",
    "nightTheme": "Thème",
    "taleText": "Texte de la berceuse (8 à 12 phrases)"
  }
}
Produis 3 scènes, 3 options de quiz, 4 animaux.`;
}

async function generateWithGemini(day: string): Promise<StoryInput | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: buildPrompt(day),
    config: { responseMimeType: 'application/json', temperature: 0.7 }
  });

  const raw = JSON.parse(response.text?.trim() || '{}');
  // On impose l'id/la date : l'IA ne contrôle pas les clés de cache.
  const parsed = storySchema.safeParse({ ...raw, id: `story-ai-${day}`, date: day });
  if (!parsed.success) {
    console.warn('[story] réponse IA rejetée par la validation', parsed.error.issues.slice(0, 3));
    return null;
  }
  return parsed.data;
}

/**
 * Édition du jour : cache base → génération IA (une seule fois par jour) → null (le client
 * utilise alors ses histoires embarquées).
 */
export async function getDailyStory(): Promise<{ story: StoryInput | null; cached: boolean }> {
  const day = todayParis();

  const mem = memoryCache.get(day);
  if (mem) return { story: mem, cached: true };

  if (hasDatabase()) {
    const rows = (await db()`select story from daily_stories where day = ${day}`) as { story: unknown }[];
    if (rows[0]) {
      const parsed = storySchema.safeParse(rows[0].story);
      if (parsed.success) {
        memoryCache.set(day, parsed.data);
        return { story: parsed.data, cached: true };
      }
    }
  }

  const story = await generateWithGemini(day).catch((err) => {
    console.error('[story] génération Gemini échouée', err);
    return null;
  });
  if (!story) return { story: null, cached: false };

  memoryCache.set(day, story);
  if (hasDatabase()) {
    await db()`
      insert into daily_stories (day, story) values (${day}, ${JSON.stringify(story)}::jsonb)
      on conflict (day) do nothing
    `;
  }
  return { story, cached: false };
}
