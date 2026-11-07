import { GoogleGenAI } from '@google/genai';

/**
 * Génération de JSON par IA avec plusieurs fournisseurs, essayés dans l'ordre (open source d'abord) :
 *   1. Modèle open source via Hugging Face (HF_TOKEN, HF_TEXT_MODEL) — Apache 2.0 par défaut
 *   2. Toute API compatible OpenAI (AI_API_KEY, AI_BASE_URL, AI_MODEL)
 *      → Ollama / LM Studio (local, open source), Groq, OpenRouter, Mistral…
 *   3. Google Gemini (GEMINI_API_KEY) — propriétaire, en dernier recours
 * Le premier qui répond un JSON valide gagne. Aucun fournisseur → null.
 */

export interface AiProvider {
  name: string;
  generate: (prompt: string) => Promise<string>;
}

const TIMEOUT_MS = 45_000;

function geminiProvider(): AiProvider | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  return {
    name: `gemini:${model}`,
    async generate(prompt) {
      const ai = new GoogleGenAI({ apiKey });
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: 'application/json', temperature: 0.7, abortSignal: AbortSignal.timeout(TIMEOUT_MS) }
      });
      return res.text ?? '';
    }
  };
}

/** Client générique pour toute API « chat/completions » compatible OpenAI. */
function chatCompletionsProvider(name: string, baseUrl: string, model: string, apiKey?: string): AiProvider {
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;
  return {
    name: `${name}:${new URL(endpoint).host}:${model}`,
    async generate(prompt) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
          // OpenRouter recommande d'identifier l'app (ignoré par les autres).
          'HTTP-Referer': 'https://pulse-kids-main.vercel.app',
          'X-Title': 'Pulse Kids'
        },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'Tu réponds uniquement avec un objet JSON valide, sans texte autour.' },
            { role: 'user', content: prompt }
          ]
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content ?? '';
    }
  };
}

/** Modèles ouverts servis par Hugging Face (routeur compatible OpenAI). */
export const DEFAULT_HF_TEXT_MODEL = 'openai/gpt-oss-20b'; // modèle ouvert Apache 2.0, servi par le routeur HF

function huggingFaceProvider(): AiProvider | null {
  const token = process.env.HF_TOKEN;
  if (!token) return null;
  return chatCompletionsProvider('huggingface', 'https://router.huggingface.co/v1', process.env.HF_TEXT_MODEL || DEFAULT_HF_TEXT_MODEL, token);
}

/** Exemples : http://localhost:11434/v1 (Ollama) · https://api.groq.com/openai/v1 · https://openrouter.ai/api/v1 */
function openAiCompatibleProvider(): AiProvider | null {
  const baseUrl = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;
  if (!baseUrl || !model) return null;
  return chatCompletionsProvider('openai-compatible', baseUrl, model, process.env.AI_API_KEY);
}

export function availableProviders(): AiProvider[] {
  return [huggingFaceProvider(), openAiCompatibleProvider(), geminiProvider()].filter((p): p is AiProvider => p !== null);
}

export function hasAi(): boolean {
  return availableProviders().length > 0;
}

/** Extrait le premier objet JSON d'une réponse (tolère les blocs ```json). */
export function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) return JSON.parse(trimmed.slice(start, end + 1));
    throw new Error('Réponse IA sans JSON exploitable');
  }
}

/**
 * Essaie chaque fournisseur ; `accept` valide le JSON (schéma zod) et renvoie null si refusé.
 * Un JSON invalide chez un fournisseur fait passer au suivant.
 */
export async function generateJson<T>(prompt: string, accept: (raw: unknown) => T | null): Promise<{ value: T; provider: string } | null> {
  for (const provider of availableProviders()) {
    try {
      const value = accept(extractJson(await provider.generate(prompt)));
      if (value !== null) return { value, provider: provider.name };
      console.warn(`[ai] ${provider.name} : réponse rejetée par la validation`);
    } catch (err) {
      console.warn(`[ai] ${provider.name} indisponible :`, err instanceof Error ? err.message : err);
    }
  }
  return null;
}
