import React, { useState } from 'react';
import { Volume2, Telescope, ExternalLink } from 'lucide-react';
import { soundEffects, speakFrenchText, stopSpeaking } from '../utils/soundEffects';
import type { SpacePhotoData } from '../services/newsService';

interface SpacePhotoCardProps {
  photo: SpacePhotoData;
}

/** Bonus du jour : une vraie photo de la NASA (domaine public) avec une légende pour les 5 ans. */
export const SpacePhotoCard: React.FC<SpacePhotoCardProps> = ({ photo }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  if (failed) return null;

  const handleListen = () => {
    soundEffects.playPop();
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speakFrenchText(`${photo.title}. ${photo.caption}`, {
      rate: 0.85,
      pitch: 1.15,
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false)
    });
  };

  return (
    <article className="w-full bg-white rounded-3xl border-2 border-indigo-300/80 shadow-md overflow-hidden transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 pb-3 border-b border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-indigo-50/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-indigo-500 text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0">
            <Telescope className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
              BONUS • LA PHOTO DE L’ESPACE DU JOUR
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-indigo-950 mt-0.5 leading-snug">
              {photo.emoji} {photo.title}
            </h2>
          </div>
        </div>

        <button
          onClick={handleListen}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black border shadow-xs transition-transform active:scale-95 self-stretch sm:self-auto justify-center ${
            speaking ? 'bg-indigo-600 text-white border-indigo-700 animate-pulse' : 'bg-indigo-400 hover:bg-indigo-500 text-indigo-950 border-indigo-500'
          }`}
          aria-label="Écouter la légende de la photo"
        >
          <Volume2 className="w-4 h-4" />
          <span>{speaking ? 'Chut, j’écoute !' : 'Écoute la photo'}</span>
        </button>
      </div>

      {/* Photo */}
      <div className="p-4 sm:p-5 space-y-3">
        <figure className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-[4/3] border-2 border-indigo-200">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center text-5xl animate-pulse" aria-hidden>
              🔭
            </div>
          )}
          <img
            src={photo.imageUrl}
            alt={`${photo.title} — photo de la NASA`}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100 animate-in zoom-in-95 duration-700' : 'opacity-0'}`}
          />
        </figure>

        <p className="text-sm sm:text-base font-semibold text-slate-700 leading-relaxed">{photo.caption}</p>

        <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1">
          <span>
            Crédit : {photo.credit}
            {photo.originalTitle ? ` — « ${photo.originalTitle} »` : ''}
          </span>
          <a
            href={photo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 underline hover:text-indigo-700"
          >
            source <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>
    </article>
  );
};
