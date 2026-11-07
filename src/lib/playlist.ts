import type { Today, VideoScene } from '../../shared/schemas';
import { VIDEOS, VIDEO_THEMES, type MiniVideo } from '../data/videos';
import { creditLine, videoPhoto } from '../data/videoImages';

/** Une vidéo jouable : une suite de scènes narrées (avec éventuellement une photo). */
export interface Playable {
  id: string;
  title: string;
  emoji: string;
  scenes: VideoScene[];
  thumb?: string;
  category?: string;
}

const BGS: VideoScene['bg'][] = ['soleil', 'menthe', 'ciel', 'rose', 'lavande'];

export function fromMiniVideo(v: MiniVideo, index: number): Playable {
  const photo = videoPhoto(v.id);
  const bg = (i: number) => BGS[(index + i) % BGS.length];
  const scenes: VideoScene[] = [
    { emoji: v.emoji, bg: bg(0), text: `${VIDEO_THEMES[v.theme].emoji} ${v.title} !` },
    ...v.scenes.map((text, i): VideoScene =>
      // La photo accompagne la première explication.
      i === 0 && photo
        ? { emoji: v.emoji, bg: 'nuit', text, imageUrl: photo.url, credit: creditLine(photo.credit) }
        : { emoji: v.emoji, bg: bg(i + 1), text }
    )
  ];
  return { id: v.id, title: v.title, emoji: v.emoji, scenes, thumb: photo?.url, category: v.theme };
}

export const TODAY_ID = 'journal-du-jour';

export function fromToday(t: Today): Playable {
  const photo = t.scenes.find((s) => s.imageUrl)?.imageUrl;
  return { id: TODAY_ID, title: t.title, emoji: t.emoji, scenes: t.scenes, thumb: photo };
}

/** Le journal du jour, puis les 50 mini-vidéos (mélangées par thème), à regarder à la suite. */
export function buildPlaylist(today: Today): Playable[] {
  return [fromToday(today), ...VIDEOS.map(fromMiniVideo)];
}
