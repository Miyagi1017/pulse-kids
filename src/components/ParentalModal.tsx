import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Clock, Bell, EyeOff, Wifi, Award, RefreshCw, Volume2 } from 'lucide-react';
import { ParentalSettings, UserProgress } from '../types/news';
import { verifyParentPin, verifyAdultChallenge, formatTimeDisplay } from '../utils/screenTime';
import { soundEffects } from '../utils/soundEffects';

interface ParentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ParentalSettings;
  onUpdateSettings: (newSettings: ParentalSettings) => void;
  progress: UserProgress;
  onResetScreenTime: () => void;
  onAddExtraTime: (minutes: number) => void;
}

export const ParentalModal: React.FC<ParentalModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  progress,
  onResetScreenTime,
  onAddExtraTime
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [mathAnswer, setMathAnswer] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Adult challenge: simple arithmetic that a 5yo can't calculate
  const [challenge] = useState({ num1: 7, num2: 8, correct: 56 });

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyParentPin(pinInput, settings.pin) || parseInt(mathAnswer, 10) === challenge.correct) {
      setIsAuthenticated(true);
      setErrorMsg(null);
      soundEffects.playPop();
    } else {
      setErrorMsg('Code ou réponse incorrecte. Ce panneau est réservé aux parents !');
    }
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setMathAnswer('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white border-3 border-indigo-200 p-5 sm:p-7 shadow-2xl text-slate-800 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-indigo-950 font-['Fredoka']">
                Espace Contrôle Parental
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Sécurité enfant, temps d’écran & confidentialité
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition-all"
            aria-label="Fermer le contrôle parental"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verification Gate if not authenticated */}
        {!isAuthenticated ? (
          <form onSubmit={handleVerify} className="space-y-4 py-3 text-center">
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-left">
              <p className="text-xs font-bold text-indigo-900 mb-1">
                VÉRIFICATION ADULTE
              </p>
              <p className="text-sm font-semibold text-slate-700">
                Pour protéger votre enfant, répondez à ce calcul ou entrez votre code PIN (par défaut : 1234) :
              </p>
              
              <div className="mt-3 bg-white p-3 rounded-xl border border-indigo-200 text-center text-lg font-black text-indigo-900">
                Combien font {challenge.num1} × {challenge.num2} ?
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Réponse au calcul :
                </label>
                <input
                  type="number"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  placeholder="Ex: 56"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-hidden font-bold text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Ou Code PIN (Défaut: 1234) :
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="1234"
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:outline-hidden font-bold text-base tracking-widest text-center"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base shadow-md transition-all active:scale-98"
            >
              Déverrouiller l’espace parents
            </button>
          </form>
        ) : (
          /* Authenticated Parental Dashboard */
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            
            {/* 1. SCREEN TIME MANAGER (Temps d'écran 15 min & alertes) */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-700" />
                  <h3 className="text-base font-extrabold text-amber-950 font-['Fredoka']">
                    Gestion du Temps d’Écran
                  </h3>
                </div>
                <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
                  Actuel : {settings.screenTimeMinutes} min
                </span>
              </div>

              <p className="text-xs font-medium text-slate-600">
                Temps passé aujourd’hui : <span className="font-bold text-amber-900">{formatTimeDisplay(progress.timeSpentSecondsToday)}</span> sur {settings.screenTimeMinutes} min recommandées (15 min pour un enfant de 5 ans).
              </p>

              {/* Time Selection Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1">
                {[5, 10, 15, 20, 30, 0].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, screenTimeMinutes: mins })}
                    className={`py-2 px-1 rounded-xl text-xs font-extrabold border transition-all ${
                      settings.screenTimeMinutes === mins
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-100/60'
                    }`}
                  >
                    {mins === 0 ? 'Illimité' : `${mins} min`}
                  </button>
                ))}
              </div>

              {/* Alert threshold */}
              <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-700" />
                  Alerte bienveillante avant la fin :
                </span>
                <select
                  value={settings.audioWarningMinutesBefore}
                  onChange={(e) => onUpdateSettings({ ...settings, audioWarningMinutesBefore: Number(e.target.value) })}
                  className="bg-white border border-amber-300 rounded-lg px-2 py-1 text-xs font-bold"
                >
                  <option value={1}>1 minute avant</option>
                  <option value={2}>2 minutes avant (recommandé)</option>
                  <option value={3}>3 minutes avant</option>
                </select>
              </div>

              {/* Action: Add Extra Time or Reset */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onAddExtraTime(5)}
                  className="flex-1 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1 shadow-2xs"
                >
                  +5 minutes bonus
                </button>
                <button
                  type="button"
                  onClick={onResetScreenTime}
                  className="flex-1 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1 shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Réinitialiser le compteur
                </button>
              </div>
            </div>

            {/* 2. PEDAGOGICAL INSIGHTS / APPRENTISSAGES DU JOUR */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border-2 border-indigo-200 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-700" />
                <h3 className="text-base font-extrabold text-indigo-950 font-['Fredoka']">
                  Bilan Pédagogique du Jour
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <div className="text-lg font-black text-indigo-900">{progress.starsEarned} / 5</div>
                  <div className="text-[11px] font-bold text-slate-500">Étoiles gagnées</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100 shadow-2xs">
                  <div className="text-lg font-black text-indigo-900">{progress.wordsDiscovered?.length || 4} mots</div>
                  <div className="text-[11px] font-bold text-slate-500">Vocabulaire acquis</div>
                </div>
              </div>

              <p className="text-xs text-slate-600">
                Mots découverts aujourd’hui : <span className="font-bold text-indigo-900">Bâtisseur, Chaudière, Radiateur, Chaleur, Énergie</span>.
              </p>
            </div>

            {/* 3. ZERO ADS & PRIVACY GUARANTEE (Sans publicité & Hors-ligne) */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border-2 border-emerald-300 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Garanties Sérénité & Confidentialité</span>
              </div>
              <ul className="text-xs font-medium text-emerald-950 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span>
                  <strong>100% Sans Publicité :</strong> Aucun tracker publicitaire, aucune interruption commerciale.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span>
                  <strong>Confidentialité Totale :</strong> Aucune donnée personnelle n’est envoyée à des tiers. Les progrès restent sur votre appareil.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-600 font-black">✓</span>
                  <strong>Mode Hors-Ligne Intégral :</strong> Fonctionne partout en vacances, train et avion sans connexion internet.
                </li>
              </ul>
            </div>

            {/* 4. PIN SETTING */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Changer le code PIN parent :
              </label>
              <input
                type="text"
                value={settings.pin}
                onChange={(e) => onUpdateSettings({ ...settings, pin: e.target.value.slice(0, 6) })}
                className="w-24 px-2 py-1 text-center font-bold text-sm border border-slate-300 rounded-lg"
                maxLength={6}
              />
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all"
            >
              Enregistrer et Fermer
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
