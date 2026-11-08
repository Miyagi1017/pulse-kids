import '@fontsource/fredoka/latin-500.css';
import '@fontsource/fredoka/latin-700.css';
import { continueRender, delayRender } from 'remotion';

/** Le rendu attend la police de l'app, sinon les premières images sortiraient dans une autre police. */
if (typeof document !== 'undefined') {
  const handle = delayRender('Chargement de la police Fredoka');
  Promise.all([document.fonts.load('500 40px Fredoka'), document.fonts.load('700 40px Fredoka')])
    .catch(() => undefined)
    .finally(() => continueRender(handle));
}

export const FONT = 'Fredoka, "Segoe UI Emoji", sans-serif';
