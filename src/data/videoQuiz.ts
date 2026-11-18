/**
 * Une question de compréhension pour chacune des 10 mini-vidéos.
 *
 * Elle arrive à la fin de la vidéo : 3 gros boutons, une seule bonne réponse.
 * `why` est la petite explication dite après le choix (« Le savais-tu ? ») :
 * elle transforme la vidéo en moment d’apprentissage, sans jamais gronder.
 */
export interface VideoQuiz {
  q: string;
  choices: [string, string, string];
  /** Index de la bonne réponse. */
  answer: number;
  why: string;
}

export const VIDEO_QUIZ: Record<string, VideoQuiz> = {
  'video-animaux-01': {
    q: 'Pour avoir chaud, que font les manchots ?',
    choices: ['Ils se serrent les uns contre les autres', 'Ils allument un feu', 'Ils plongent dans l’eau glacée'],
    answer: 0,
    why: 'En se serrant, les manchots partagent leur chaleur : au milieu du groupe, il fait presque chaud !'
  },
  'video-animaux-02': {
    q: 'À quoi sert la trompe de l’éléphant ?',
    choices: ['À sentir, attraper et boire', 'À voler', 'À dormir'],
    answer: 0,
    why: 'La trompe est un nez très long : l’éléphant respire, attrape des branches et aspire de l’eau avec.'
  },
  'video-animaux-03': {
    q: 'Pourquoi la girafe a-t-elle un long cou ?',
    choices: ['Pour manger les feuilles tout en haut', 'Pour mieux dormir', 'Pour nager plus vite'],
    answer: 0,
    why: 'Son cou lui permet d’atteindre les feuilles des grands arbres, là où les autres animaux ne peuvent pas manger.'
  },
  'video-animaux-05': {
    q: 'Pourquoi les dauphins remontent-ils à la surface ?',
    choices: ['Pour respirer', 'Pour boire', 'Pour dormir au sec'],
    answer: 0,
    why: 'Les dauphins sont des mammifères : ils ont besoin d’air et respirent par un trou sur leur tête.'
  },
  'video-animaux-13': {
    q: 'Que mange surtout le panda géant ?',
    choices: ['Du bambou', 'Du poisson', 'Des noisettes'],
    answer: 0,
    why: 'Le panda passe presque toute sa journée à manger du bambou, et il faut le protéger.'
  },
  'video-animaux-15': {
    q: 'Comment la baleine respire-t-elle ?',
    choices: ['Par un trou sur sa tête', 'Avec ses nageoires', 'Par sa bouche sous l’eau'],
    answer: 0,
    why: 'Elle remonte à la surface et respire par son évent : c’est ce qui fait le grand jet d’eau.'
  },
  'video-nature-02': {
    q: 'Combien de couleurs un arc-en-ciel a-t-il ?',
    choices: ['Sept', 'Deux', 'Mille'],
    answer: 0,
    why: 'La lumière du soleil se sépare en sept couleurs quand elle traverse les gouttes de pluie.'
  },
  'video-espace-01': {
    q: 'La Lune fabrique-t-elle sa propre lumière ?',
    choices: ['Non, elle renvoie celle du Soleil', 'Oui, elle brûle', 'Oui, elle est électrique'],
    answer: 0,
    why: 'La Lune est comme un miroir : elle renvoie la lumière du Soleil.'
  },
  'video-espace-03': {
    q: 'Combien de planètes tournent autour du Soleil ?',
    choices: ['Huit', 'Deux', 'Cent'],
    answer: 0,
    why: 'Autour du Soleil tournent huit planètes. La Terre est la troisième, et la seule où l’on connaît la vie.'
  },
  'video-corps-01': {
    q: 'Que faut-il faire pour garder de belles dents ?',
    choices: ['Les brosser matin et soir', 'Manger des bonbons toute la journée', 'Ne jamais les laver'],
    answer: 0,
    why: 'Se brosser les dents matin et soir chasse les petits restes de nourriture qui abîment l’émail.'
  }
};

export function quizFor(videoId: string): VideoQuiz | undefined {
  return VIDEO_QUIZ[videoId];
}
