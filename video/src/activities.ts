import { personalize } from '../../src/data/format';
import { PHYSIQUES } from '../../src/data/physiques';
import { ESSENTIELS } from '../../src/data/programmes';
import { SPORT_TIPS, type SportTip } from '../../src/data/sport';
import { WUSHU } from '../../src/data/wushu';

export { compositionId } from '../../src/lib/sportVideos';

/** Les vidéos ne connaissent pas le prénom de l'enfant : {p} devient « petit curieux ». */
const noName = (text: string) => personalize(text, '');

export const VIDEO_ACTIVITIES: SportTip[] = [...PHYSIQUES, ...WUSHU, ...ESSENTIELS, ...SPORT_TIPS].map((a) => ({
  ...a,
  title: noName(a.title),
  tip: noName(a.tip),
  moves: a.moves.map((m) => ({ ...m, text: noName(m.text) }))
}));
