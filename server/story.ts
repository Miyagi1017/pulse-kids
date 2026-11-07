import { storySchema, type StoryInput } from '../shared/schemas.js';
import { generateJson } from './ai.js';
import { cacheGet, cacheSet, once } from './cache.js';

export function todayParis(): string {
  // Date « du jour » côté enfants français, indépendante du fuseau du serveur.
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}

const validStory = (raw: unknown) => {
  const r = storySchema.safeParse(raw);
  return r.success ? r.data : null;
};

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

/**
 * Édition du jour : cache (mémoire → Postgres) → génération IA (une fois par jour,
 * Gemini puis API compatible OpenAI) → null (le client utilise ses histoires embarquées).
 */
export async function getDailyStory(): Promise<{ story: StoryInput | null; provider?: string }> {
  const day = todayParis();
  const key = `story:${day}`;

  const cached = await cacheGet(key, validStory);
  if (cached) return { story: cached, provider: 'cache' };

  return once(key, async () => {
    const result = await generateJson(buildPrompt(day), (raw) =>
      // L'id et la date sont imposés : l'IA ne contrôle pas les clés de cache.
      validStory({ ...(raw as object), id: `story-ai-${day}`, date: day })
    );
    if (!result) return { story: null };
    await cacheSet(key, result.value);
    return { story: result.value, provider: result.provider };
  });
}