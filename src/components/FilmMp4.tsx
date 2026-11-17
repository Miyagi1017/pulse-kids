import { useEffect, useRef } from 'react';
import { cuesUrl, mp4Url, nameAt, sceneAt, type FilmCues } from '../videos/source';
import { bankHas, profileName } from '../voice/player';
import { nameFile } from '../voice/names';

/**
 * Le film MP4 Lemo-Opuscar d'une vidéo. Il donne la scène en cours (pour le texte à l'écran), dit le prénom
 * avec la voix de Christine dans les silences prévus (cues.names), et rend la main au dessin animé en code
 * (onFail, à la scène en cours) s'il ne se charge pas ou si l'appareil passe hors ligne.
 */
export function FilmMp4({ id, playing, onScene, onEnd, onFail }: { id: string; playing: boolean; onScene: (i: number) => void; onEnd: () => void; onFail: (scene: number) => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const cues = useRef<FilmCues | null>(null);
  const scene = useRef(0);
  const last = useRef(0);
  const cb = useRef({ onScene, onEnd, onFail });
  cb.current = { onScene, onEnd, onFail };

  useEffect(() => {
    let alive = true;
    fetch(cuesUrl(id))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((c: FilmCues) => {
        if (alive) cues.current = c;
      })
      .catch(() => alive && cb.current.onFail(scene.current));
    const offline = () => cb.current.onFail(scene.current);
    window.addEventListener('offline', offline);
    return () => {
      alive = false;
      window.removeEventListener('offline', offline);
    };
  }, [id]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (playing) void v.play().catch(() => undefined);
    else v.pause();
  }, [playing]);

  const onTime = () => {
    const v = ref.current,
      c = cues.current;
    if (!v || !c) return;
    const t = v.currentTime;
    const s = sceneAt(c.scenes, t);
    if (s !== scene.current) {
      scene.current = s;
      cb.current.onScene(s);
    }
    const name = profileName();
    if (name && bankHas(nameFile(name)) && nameAt(c.names, last.current, t).length) void new Audio(`/banque/${nameFile(name)}.mp3`).play().catch(() => undefined);
    last.current = t;
  };

  return (
    <video
      ref={ref}
      src={mp4Url(id)}
      autoPlay
      playsInline
      className="block w-full aspect-video bg-black"
      onTimeUpdate={onTime}
      onEnded={() => cb.current.onEnd()}
      onError={() => cb.current.onFail(scene.current)}
    />
  );
}
