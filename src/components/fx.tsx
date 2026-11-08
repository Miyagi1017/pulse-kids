import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';
import { soundEffects, speakFrenchText } from '../utils/soundEffects';
import { ballistic, boing, BREATHE, float, jump, spin, SPRING_BOUNCY, wiggle } from '../lib/motion';

/**
 * Effets interactifs partagés :
 *  - `burst()` : une gerbe d'emojis qui jaillit de l'endroit touché (dessinée par <BurstLayer />,
 *    monté une seule fois à la racine, pour que les particules survivent aux changements d'écran) ;
 *  - <Mascot /> : l'ami choisi par l'enfant, qui réagit quand on le touche ou qu'on le tire.
 * Tout est coupé si l'appareil demande de réduire les animations.
 */

interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
  vx: number;
  vy: number;
  size: number;
}

const MAX_PARTICLES = 60;
let nextId = 0;
const listeners = new Set<(ps: Particle[]) => void>();

const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Point d'origine d'un geste ; au clavier (pas de coordonnées), le centre de l'élément. */
export function pointOf(e: MouseEvent<Element> | PointerEvent<Element>): { x: number; y: number } {
  if (e.clientX || e.clientY) return { x: e.clientX, y: e.clientY };
  const r = e.currentTarget.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Fait jaillir `count` emojis depuis (x, y), coordonnées de la fenêtre. */
export function burst(x: number, y: number, chars: string | string[], count = 8) {
  if (listeners.size === 0 || prefersReducedMotion()) return;
  const list = Array.isArray(chars) ? chars : [chars];
  const ps = Array.from({ length: count }, (_, i): Particle => {
    // Gerbe vers le haut (éventail de -165° à -15°), comme une poignée de confettis lancée.
    const angle = -Math.PI + 0.26 + ((i + Math.random() * 0.8) / count) * (Math.PI - 0.52);
    const speed = 260 + Math.random() * 180;
    return {
      id: nextId++,
      x,
      y,
      char: list[i % list.length],
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 1.2 + Math.random() * 1.1
    };
  });
  listeners.forEach((l) => l(ps));
}

export function BurstLayer() {
  const [items, setItems] = useState<Particle[]>([]);

  useEffect(() => {
    const add = (ps: Particle[]) => setItems((cur) => [...cur, ...ps].slice(-MAX_PARTICLES));
    listeners.add(add);
    return () => {
      listeners.delete(add);
    };
  }, []);

  const remove = (id: number) => setItems((cur) => cur.filter((p) => p.id !== id));

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden>
      {items.map((p) => {
        // Vraie gravité : la particule monte, ralentit au sommet, retombe en tournant sur elle-même.
        const path = ballistic(p.vx, p.vy, 950, 1.15);
        return (
          <motion.span
            key={p.id}
            className="absolute leading-none"
            style={{ left: p.x, top: p.y, fontSize: `${p.size}rem`, marginLeft: '-0.5em', marginTop: '-0.5em' }}
            initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
            animate={{ x: path.x, y: path.y, rotate: p.vx * 0.5, scale: [0.2, 1.15, 1, 0.85], opacity: [1, 1, 1, 0] }}
            transition={{
              x: { duration: 1.15, times: path.times, ease: 'linear' },
              y: { duration: 1.15, times: path.times, ease: 'linear' },
              rotate: { duration: 1.15, ease: 'easeOut' },
              scale: { duration: 1.15, times: [0, 0.14, 0.35, 1], ease: 'easeOut' },
              opacity: { duration: 1.15, times: [0, 0.55, 0.78, 1] }
            }}
            onAnimationComplete={() => remove(p.id)}
          >
            {p.char}
          </motion.span>
        );
      })}
    </div>,
    document.body
  );
}

/* ---------- Voix : le prénom ---------- */

let greeted = false;

/** Dit « Bonjour {prénom} ! ». `once` : une seule fois par visite (l'accueil ne se répète pas à chaque retour). */
export function sayHello(greeting: string, name: string, { once = false } = {}) {
  if (once && greeted) return;
  greeted = true;
  speakFrenchText(`${greeting} ${name} !`, { rate: 0.9, pitch: 1.2 });
}

/** Le premier écran a déjà salué l'enfant : l'accueil ne le refait pas juste après. */
export function markGreeted() {
  greeted = true;
}

/* ---------- Mascotte ---------- */

/** Réactions « dessin animé » : élan, écrasement, amorti (voir lib/motion.ts). */
const REACTIONS = [jump(44), wiggle(18), spin(), boing()];

const PHRASES = ['Coucou {name} !', 'Hi hi, ça chatouille !', 'On joue, {name} ?', 'Youpi !', 'Encore, encore !', 'Tu es mon meilleur ami, {name} !'];

/** L'ami de l'enfant : on le touche, il saute et parle ; on le tire, il revient comme un élastique. */
export function Mascot({ avatar, name, className = '' }: { avatar: string; name: string; className?: string }) {
  const controls = useAnimationControls();
  const reduce = useReducedMotion();
  const turn = useRef(0);
  const dragged = useRef(false);

  const poke = (e: MouseEvent<HTMLButtonElement>) => {
    if (dragged.current) return; // le clic qui termine un glisser ne compte pas
    const i = turn.current++;
    soundEffects.playBoing();
    if (!reduce) void controls.start(REACTIONS[i % REACTIONS.length]);
    const p = pointOf(e);
    burst(p.x, p.y, ['✨', '💖', '⭐'], 7);
    speakFrenchText(PHRASES[i % PHRASES.length].replaceAll('{name}', name), { rate: 1, pitch: 1.3 });
  };

  const idle = float(6, 2.4);
  return (
    // Trois couches : flotte doucement · respire · réagit (jamais figé, même au repos).
    <motion.span className="inline-block" animate={idle.animate} transition={idle.transition}>
      <motion.span className="inline-block" style={{ originY: 1 }} animate={BREATHE.animate} transition={BREATHE.transition}>
        <motion.button
          type="button"
          drag={!reduce}
          dragSnapToOrigin
          dragElastic={0.7}
          dragConstraints={{ left: -40, right: 40, top: -30, bottom: 30 }}
          // Relâché, il revient comme un élastique, avec un petit rebond.
          dragTransition={{ bounceStiffness: 520, bounceDamping: 11 }}
          whileDrag={{ scale: 1.15, rotate: -8, transition: SPRING_BOUNCY }}
          onDragStart={() => {
            dragged.current = true;
            soundEffects.playBoing();
          }}
          onDragEnd={() => setTimeout(() => (dragged.current = false), 60)}
          whileTap={{ scaleY: 0.82, scaleX: 1.12, transition: SPRING_BOUNCY }}
          animate={controls}
          onClick={poke}
          style={{ originY: 1 }}
          className={`leading-none touch-none cursor-grab active:cursor-grabbing ${className}`}
          aria-label={`Ton ami ${avatar} : touche-le !`}
        >
          {avatar}
        </motion.button>
      </motion.span>
    </motion.span>
  );
}
