import { useMemo, useState, type PointerEvent } from 'react';
import { motion, useAnimationControls } from 'motion/react';
import type { Tale } from '../data/format';
import { ambienceFor } from '../data/ambience';
import { illustrationFor } from '../data/illustrations';
import { soundEffects } from '../utils/soundEffects';
import { burst } from './fx';
import { float, jump } from '../lib/motion';

const heroFloat = float(10, 2.4);
const nightFloat = float(6, 3.6);

/**
 * Illustration animée d'un conte :
 *  - effet « Ken Burns » (zoom + panoramique lents), direction différente à chaque page ;
 *  - particules d'ambiance propres au conte (bulles, flocons, pétales, étoiles…) ;
 *  - repli sur le gros emoji animé si l'illustration n'existe pas encore.
 */
const PANS = [
  { from: { scale: 1.02, x: '-2%', y: '1%' }, to: { scale: 1.14, x: '2%', y: '-2%' } },
  { from: { scale: 1.14, x: '2%', y: '-1%' }, to: { scale: 1.03, x: '-2%', y: '1%' } },
  { from: { scale: 1.04, x: '0%', y: '2%' }, to: { scale: 1.16, x: '0%', y: '-3%' } },
  { from: { scale: 1.12, x: '-3%', y: '0%' }, to: { scale: 1.04, x: '3%', y: '0%' } }
];

function Particles({ tale }: { tale: Tale }) {
  const amb = useMemo(() => ambienceFor(tale), [tale]);
  const items = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        char: amb.particles[i % amb.particles.length],
        left: (i * 37 + 11) % 100,
        top: (i * 53 + 7) % 100,
        size: 0.9 + ((i * 7) % 5) * 0.25,
        delay: (i % 6) * 0.7,
        dur: 6 + (i % 5)
      })),
    [amb]
  );

  const anim = (i: number) => {
    switch (amb.motion) {
      case 'rise':
        return { y: ['20%', '-120%'], opacity: [0, 0.9, 0] };
      case 'fall':
        return { y: ['-120%', '120%'], x: ['0%', i % 2 ? '30%' : '-30%'], rotate: [0, 180], opacity: [0, 0.9, 0] };
      case 'twinkle':
        return { scale: [0.6, 1.2, 0.6], opacity: [0.2, 1, 0.2] };
      case 'drift':
        return { x: ['-20%', '40%'], y: ['0%', '-60%'], rotate: [0, 40], opacity: [0, 0.85, 0] };
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {items.map((p, i) => (
        <motion.span
          key={i}
          className="absolute drop-shadow"
          style={{ left: `${p.left}%`, top: `${p.top}%`, fontSize: `${p.size}rem` }}
          animate={anim(i)}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {p.char}
        </motion.span>
      ))}
    </div>
  );
}

export function TaleScene({ tale, page }: { tale: Tale; page: number }) {
  const src = illustrationFor(tale.id);
  const [failed, setFailed] = useState(false);
  const night = tale.kind === 'soir';
  const pan = PANS[page % PANS.length];
  const amb = useMemo(() => ambienceFor(tale), [tale]);
  const hop = useAnimationControls();

  // Toucher l'image : les particules du conte jaillissent du doigt, et le héros sautille.
  const touch = (e: PointerEvent<HTMLElement>) => {
    soundEffects.playSparkle();
    burst(e.clientX, e.clientY, [...amb.particles.filter((c) => c !== '·'), tale.emoji], 8);
    void hop.start(jump(22, 0.75));
  };

  if (!src || failed) {
    return (
      <div className="relative w-full max-w-md aspect-[4/3] flex items-center justify-center cursor-pointer" onPointerDown={touch}>
        <Particles tale={tale} />
        <motion.div animate={hop} style={{ originY: 1 }} aria-hidden>
          <motion.div
            className="text-8xl sm:text-9xl"
            animate={(night ? nightFloat : heroFloat).animate}
            transition={(night ? nightFloat : heroFloat).transition}
          >
            {tale.emoji}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <figure onPointerDown={touch} className={`relative w-full max-w-lg aspect-[4/3] rounded-[2rem] overflow-hidden shadow-bonbon ring-4 cursor-pointer ${night ? 'ring-white/15' : 'ring-white'}`}>
      <motion.img
        key={page}
        src={src}
        alt=""
        draggable={false}
        onError={() => setFailed(true)}
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ opacity: 0, ...pan.from }}
        animate={{ opacity: 1, ...pan.to }}
        transition={{ opacity: { duration: 0.6 }, default: { duration: 14, ease: 'easeInOut' } }}
      />
      {night && <div className="absolute inset-0 bg-nuit/25" aria-hidden />}
      <Particles tale={tale} />
      <motion.span animate={hop} style={{ originY: 1 }} className="absolute bottom-3 right-3 text-3xl bg-white/85 rounded-2xl w-12 h-12 flex items-center justify-center shadow" aria-hidden>
        {tale.emoji}
      </motion.span>
    </figure>
  );
}
