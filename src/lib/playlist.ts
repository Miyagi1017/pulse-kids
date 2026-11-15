import type { Today, VideoScene } from '../../shared/schemas';
import { VIDEOS, type MiniVideo } from '../data/videos';
import { CAPSULES, type Capsule } from '../videos/capsules';

/** Une vidéo jouable : une suite de scènes narrées (dessin animé codé pour les 50 mini-vidéos). */
export interface Playable {
  id: string;
  title: string;
  emoji: string;
  scenes: VideoScene[];
  thumb?: string;
  category?: string;
  /** Mini-vidéo dessinée en code (src/videos) : le lecteur affiche son dessin animé. */
  mini?: MiniVideo | Capsule;
}

const BGS: VideoScene['bg'][] = ['soleil', 'menthe', 'ciel', 'rose', 'lavande'];

export function fromMiniVideo(v: MiniVideo, index: number): Playable {
  const bg = (i: number) => BGS[(index + i) % BGS.length];
  // Plus de photo : chaque scène est dessinée en code (src/videos/videoScene.ts), dans le style de la vidéo.
  const scenes: VideoScene[] = [{ emoji: v.emoji, bg: bg(0), text: `${v.title} !` }, ...v.scenes.map((text, i): VideoScene => ({ emoji: v.emoji, bg: bg(i + 1), text }))];
  return { id: v.id, title: v.title, emoji: v.emoji, scenes, category: v.theme, mini: v };
}

/** Un des 66 dessins animés du catalogue : titre, puis ses 4 phrases (rangé dans « catalogue »). */
export function fromCapsule(c: Capsule, index: number): Playable {
  const bg = (i: number) => BGS[(index + i) % BGS.length];
  const scenes: VideoScene[] = [{ emoji: c.emoji, bg: bg(0), text: `${c.title} !` }, ...c.scenes.map((text, i): VideoScene => ({ emoji: c.emoji, bg: bg(i + 1), text }))];
  return { id: c.id, title: c.title, emoji: c.emoji, scenes, category: 'catalogue', mini: c };
}

export const TODAY_ID = 'journal-du-jour';

export function fromToday(t: Today): Playable {
  const photo = t.scenes.find((s) => s.imageUrl)?.imageUrl;
  return { id: TODAY_ID, title: t.title, emoji: t.emoji, scenes: t.scenes, thumb: photo };
}

/** Le journal du jour, les 50 mini-vidéos (mélangées par thème), puis les 66 dessins animés du catalogue. */
export function buildPlaylist(today: Today): Playable[] {
  return [fromToday(today), ...VIDEOS.map(fromMiniVideo), ...CAPSULES.map(fromCapsule)];
}
