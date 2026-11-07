import { aiThemeSchema, todaySchema, type AiTheme, type Today, type VideoScene } from '../shared/schemas.js';
import { generateJson } from './ai.js';
import { cacheGet, cacheSet, once } from './cache.js';
import { factFor, frenchDate, seasonFor, type Season } from '../shared/dailyContent.js';
import { todayParis } from './date.js';
import { getSpacePhoto } from './space.js';

/**
 * « La vidéo du jour » : un petit dessin animé narré, construit à partir des vraies
 * informations du jour (date, saison, météo, photo NASA, anecdote, thème IA).
 * Le prénom n'est jamais envoyé au serveur : les textes contiennent « {p} ».
 */

// ---- Météo (Open-Meteo : open source, gratuit, sans clé) ----

interface Weather {
  temp: number;
  code: number;
}

function describeWeather(w: Weather): { emoji: string; sky: string; advice: string } {
  const c = w.code;
  const [emoji, sky] =
    c === 0 ? ['☀️', 'le ciel est tout bleu']
    : c <= 2 ? ['🌤️', 'il y a un peu de nuages']
    : c === 3 ? ['☁️', 'le ciel est couvert de nuages']
    : c <= 48 ? ['🌫️', 'il y a du brouillard']
    : c <= 67 || (c >= 80 && c <= 82) ? ['🌧️', 'il pleut']
    : c <= 77 || c === 85 || c === 86 ? ['🌨️', 'il neige']
    : ['⛈️', 'il y a de l’orage'];
  const advice =
    c >= 51 && c <= 82 ? 'N’oublie pas tes bottes et ton parapluie !'
    : (c >= 71 && c <= 77) || c === 85 || c === 86 ? 'Mets ton bonnet et tes gants pour jouer dans la neige !'
    : c >= 95 ? 'Aujourd’hui, on reste bien au chaud à la maison.'
    : w.temp < 8 ? 'Il fait froid : mets un bon manteau !'
    : w.temp > 26 ? 'Il fait chaud : pense à boire de l’eau et à mettre un chapeau !'
    : 'C’est une bonne journée pour jouer dehors !';
  return { emoji, sky, advice };
}

let weatherCache: { at: number; value: Weather | null } | null = null;

async function getWeather(): Promise<Weather | null> {
  if (weatherCache && Date.now() - weatherCache.at < 30 * 60_000) return weatherCache.value;
  let value: Weather | null = null;
  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=temperature_2m,weather_code&timezone=Europe%2FParis',
      { signal: AbortSignal.timeout(8000) }
    );
    if (res.ok) {
      const data = (await res.json()) as { current?: { temperature_2m?: number; weather_code?: number } };
      const t = data.current?.temperature_2m;
      const c = data.current?.weather_code;
      if (typeof t === 'number' && typeof c === 'number') value = { temp: Math.round(t), code: c };
    }
  } catch {
    /* météo indisponible : la scène est simplement omise */
  }
  weatherCache = { at: Date.now(), value };
  return value;
}

// ---- Thème du jour écrit par l'IA (optionnel) ----

function themePrompt(day: string, season: Season, weather: Weather | null): string {
  return `Tu écris pour « Pulse Kids », une application pour enfants de 5 ans.
Nous sommes le ${frenchDate(day)} (${season.name})${weather ? `, il fait ${weather.temp} °C à Paris` : ''}.
Choisis UN thème joyeux et éducatif lié à ce jour (saison, nature, animaux, sciences, une fête ou une journée mondiale du jour si elle existe vraiment, ou un fait scientifique positif).

Règles absolues : aucune violence, peur, maladie, mort, guerre, politique, marque, ni personne réelle nommée. Phrases très courtes et simples. Ton joyeux. Pas de lien.
Tu peux écrire {p} pour le prénom de l'enfant (au maximum une fois).

Réponds UNIQUEMENT avec ce JSON :
{"theme": "titre court du thème", "emoji": "un emoji", "scenes": [
  {"emoji": "emoji", "text": "1 à 2 phrases"},
  {"emoji": "emoji", "text": "1 à 2 phrases"},
  {"emoji": "emoji", "text": "1 à 2 phrases, avec une petite question ou un défi pour l'enfant"}
]}`;
}

async function getAiTheme(day: string, season: Season, weather: Weather | null): Promise<AiTheme | null> {
  const key = `theme:${day}`;
  const valid = (raw: unknown) => {
    const r = aiThemeSchema.safeParse(raw);
    return r.success ? r.data : null;
  };
  const cached = await cacheGet(key, valid);
  if (cached) return cached;
  return once(key, async () => {
    const result = await generateJson(themePrompt(day, season, weather), valid);
    if (!result) return null;
    await cacheSet(key, result.value);
    return result.value;
  });
}

// ---- Assemblage ----

export async function getToday(): Promise<Today> {
  const day = todayParis();
  const season = seasonFor(day);
  const [weather, photo] = await Promise.all([getWeather(), getSpacePhoto().catch(() => null)]);
  const theme = await getAiTheme(day, season, weather).catch(() => null);
  const [factEmoji, fact] = factFor(day);

  const scenes: VideoScene[] = [
    { emoji: '👋', bg: 'soleil', text: `Bonjour {p} ! Nous sommes ${frenchDate(day)}. Voici ton journal du jour !` },
    { emoji: season.emoji, bg: 'menthe', text: season.text }
  ];
  if (weather) {
    const w = describeWeather(weather);
    scenes.push({ emoji: w.emoji, bg: 'ciel', text: `À Paris, il fait ${weather.temp} degrés et ${w.sky}. ${w.advice}` });
  }
  if (theme) {
    scenes.push({ emoji: theme.emoji, bg: 'rose', text: `Le thème du jour : ${theme.theme} !` });
    theme.scenes.forEach((s, i) => scenes.push({ emoji: s.emoji, bg: i % 2 ? 'menthe' : 'soleil', text: s.text }));
  }
  scenes.push({ emoji: factEmoji, bg: 'rose', text: `Le savais-tu ? ${fact}` });
  if (photo) {
    scenes.push({ emoji: photo.emoji, bg: 'nuit', text: `La photo de l’espace du jour : ${photo.title}. ${photo.caption}`, imageUrl: photo.imageUrl, credit: photo.credit });
  }
  scenes.push({ emoji: '🌙', bg: 'lavande', text: 'Ce soir, choisis un conte du soir pour faire de beaux rêves. À demain {p} !' });

  return todaySchema.parse({
    date: day,
    title: theme ? theme.theme : `Le journal du ${frenchDate(day)}`,
    emoji: theme?.emoji ?? season.emoji,
    scenes,
    sources: [weather ? 'Open-Meteo' : null, photo ? 'NASA' : null, theme ? 'IA' : null].filter(Boolean)
  });
}
