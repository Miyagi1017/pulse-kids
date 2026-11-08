/**
 * Les vidéos animées des activités sportives (fabriquées dans le dossier video/).
 * sportVideos.json liste celles qui sont publiées dans public/videos : le bouton n'apparaît que pour elles.
 */
import PUBLISHED from '../data/sportVideos.json';

export const compositionId = (activityId: string) => `sport-${activityId.replace(/[^a-zA-Z0-9-]/g, '-')}`;

const AVAILABLE = new Set<string>(PUBLISHED);

export function sportVideoUrl(activityId: string): string | null {
  const id = compositionId(activityId);
  return AVAILABLE.has(id) ? `/videos/${id}.mp4` : null;
}
