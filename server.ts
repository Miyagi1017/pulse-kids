import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// API route to generate daily kid news with Gemini
app.post('/api/news/generate', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'No GEMINI_API_KEY set, using high-quality local archive.'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Tu es le rédacteur en chef bienveillant d'un journal télévisé animé quotidien pour enfants de 5 ans ("PULSE KIDS").
D'après les actualités positives, scientifiques, écologiques ou spatiales des dernières 24 heures, conçois une édition quotidienne magique et éducative.

Format JSON STRICT attendu :
{
  "id": "story-ai-${Date.now()}",
  "date": "${new Date().toISOString().slice(0, 10)}",
  "tagline": "L'actualité magique du jour pour les p'tits curieux",
  "topic": "Titre court du thème",
  "source": "Journal des P'tits Curieux",
  "summary": "Résumé bienveillant en 2 phrases simples pour un enfant de 5 ans",
  "cartoon": {
    "title": "Titre joyeux du dessin animé avec le héros",
    "durationLabel": "3 min chrono",
    "badgeLabel": "Activité 1 sur 5",
    "heroName": "Nom du héros (ex: Nino le Renardeau, Maya l'Astronaute, Sacha le Jardinier)",
    "heroDescription": "Description mignonne du personnage",
    "scenes": [
      {
        "id": "sc-1",
        "title": "Titre scène 1",
        "narration": "Texte court et mélodieux lu à haute voix à l'enfant (2-3 phrases)",
        "durationSeconds": 15,
        "bgType": "nature",
        "character": {
          "name": "Nino",
          "avatar": "🦊",
          "mood": "happy",
          "speech": "Bonjour les amis !"
        },
        "interactiveHotspots": [
          {
            "id": "h-1",
            "label": "Objet interactif",
            "xPercent": 30,
            "yPercent": 40,
            "emoji": "🌱",
            "soundType": "pop",
            "reactionText": "Une petite graine qui pousse !"
          }
        ],
        "keyWords": [
          {
            "word": "germe",
            "syllables": "ger - me",
            "definition": "Le tout premier bébé pousse d'une plante verte.",
            "emoji": "🌱"
          }
        ]
      }
    ]
  },
  "soundQuiz": {
    "title": "Le Quiz Sonore du Jour",
    "question": "Écoute bien et devine quel objet ou animal fait ce bruit !",
    "soundToPlay": "water-tap",
    "options": [
      {
        "id": "opt-1",
        "label": "Option 1",
        "hint": "Indice rigolo",
        "emoji": "🚰",
        "isCorrect": true,
        "soundType": "water-tap"
      },
      {
        "id": "opt-2",
        "label": "Option 2",
        "hint": "Indice rigolo",
        "emoji": "🚜",
        "isCorrect": false,
        "soundType": "tractor"
      }
    ]
  },
  "animalDiscovery": {
    "title": "Touche un animal pour entendre son cri rigolo !",
    "subtitle": "Les animaux fêtent la belle nouvelle du jour !",
    "animals": [
      {
        "id": "an-1",
        "name": "La Vache",
        "soundText": "Meuhhh ! 🐮",
        "emoji": "🐮",
        "soundType": "cow"
      },
      {
        "id": "an-2",
        "name": "Le Mouton",
        "soundText": "Bêêê ! 🐑",
        "emoji": "🐑",
        "soundType": "sheep"
      }
    ]
  },
  "mysteryBubble": {
    "title": "Le Grand Mystère du Jour",
    "question": "Pourquoi la nature fait-elle cela ?",
    "shortExplanation": "Explication magique et scientifique adaptée à 5 ans",
    "detailedSecret": "Détails passionnants faciles à comprendre",
    "bubbleCount": 4
  },
  "bedtimeTale": {
    "title": "Le Conte Étoilé du Soir",
    "summary": "Une histoire douce pour faire de beaux rêves",
    "nightTheme": "Nuit paisible et nature",
    "taleText": "Texte de la douce berceuse du soir à écouter au lit."
  }
}
Réponds UNIQUEMENT avec le JSON valide, sans texte additionnel ni balises markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    });

    const text = response.text?.trim() || '';
    const data = JSON.parse(text);
    return res.json({ success: true, story: data });
  } catch (err: unknown) {
    console.error('Error generating AI news:', err);
    return res.status(200).json({
      success: false,
      fallback: true,
      error: err instanceof Error ? err.message : String(err)
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pulse Kids dev server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
