/**
 * Mélange aléatoire (Fisher–Yates), sans modifier la liste d'origine.
 * Sert à présenter les propositions d'un quiz dans un ordre différent à chaque fois :
 * sinon la bonne réponse serait toujours au même endroit (et l'enfant l'apprendrait par cœur).
 */
export function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
