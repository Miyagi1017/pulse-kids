/**
 * Le coach des défis sport, en dessin animé des années 30 (style Rubber Hose de claude-video / Lemo-Opuscar, MIT).
 * Il est piloté par les postures articulées de lib/poses.ts (tronc, bras, avant-bras, cuisses, genoux, saut) :
 * chaque mouvement montré est donc fidèle à la consigne. Le style, lui :
 *  - bras et jambes en tuyaux souples (pas d'articulation dessinée), gants blancs, grosses baskets ;
 *  - yeux « en part de tarte », tête ronde, casquette ;
 *  - décor de salle de gym peint en gris dans une fenêtre 4:3, vieille pellicule (rayures, poussières, scintillement) ;
 *  - tout est dessiné « sur les deux » (12 images/s) avec un léger tremblé de trait.
 */
import { POSES, facingOf, full, lerpAngles, skeleton, type PoseName, type Pt } from '../lib/poses';
import { hash } from '../films/engine';

export const CW = 480;
export const CH = 360;
const INK = '#141210';
const G = ['#3f3a35', '#5a544d', '#757069', '#8f8a82', '#a8a39a', '#bdb8ae'];
const FLOOR = 322;
const K = 1.5; // échelle du squelette (repère 200 × 200) dans la scène

/* ───────────── Décor : salle de gym peinte, en gris ───────────── */

function makeGym(res: number) {
  const c = document.createElement('canvas');
  c.width = CW * res;
  c.height = CH * res;
  const g = c.getContext('2d')!;
  g.scale(res, res);
  const blotch = (x0: number, y0: number, w: number, h: number, seed: number) => {
    g.save();
    g.beginPath();
    g.rect(x0, y0, w, h);
    g.clip();
    for (let i = 0; i < 8; i++) {
      const x = x0 + hash(seed, i) * w,
        y = y0 + hash(seed, i, 2) * h,
        r = 20 + hash(seed, i, 3) * 60;
      const grd = g.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, hash(seed, i, 4) > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
    g.restore();
  };
  // Mur à losanges.
  g.fillStyle = G[3];
  g.fillRect(0, 0, CW, FLOOR - 30);
  blotch(0, 0, CW, FLOOR - 30, 1);
  g.fillStyle = 'rgba(255,255,255,0.08)';
  for (let y = 18; y < FLOOR - 40; y += 34)
    for (let x = ((y / 34) % 2) * 26; x < CW; x += 52) {
      g.beginPath();
      g.moveTo(x, y - 7);
      g.lineTo(x + 6, y);
      g.lineTo(x, y + 7);
      g.lineTo(x - 6, y);
      g.closePath();
      g.fill();
    }
  // Plinthe et parquet en perspective.
  g.fillStyle = G[1];
  g.fillRect(0, FLOOR - 36, CW, 8);
  g.fillStyle = G[2];
  g.fillRect(0, FLOOR - 28, CW, CH - FLOOR + 28);
  blotch(0, FLOOR - 28, CW, CH - FLOOR + 28, 2);
  g.strokeStyle = 'rgba(30,26,22,0.28)';
  g.lineWidth = 1.4;
  for (let k = -10; k <= 10; k++) {
    g.beginPath();
    g.moveTo(CW / 2 + k * 24, FLOOR - 28);
    g.lineTo(CW / 2 + k * 70, CH);
    g.stroke();
  }
  // Espalier à gauche, ballon de gym à droite, fenêtre ronde.
  g.fillStyle = G[0];
  g.fillRect(28, 40, 8, FLOOR - 70);
  g.fillRect(96, 40, 8, FLOOR - 70);
  for (let y = 56; y < FLOOR - 40; y += 24) {
    g.fillStyle = G[1];
    g.fillRect(32, y, 70, 6);
  }
  g.fillStyle = G[1];
  g.beginPath();
  g.arc(410, FLOOR - 14, 30, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = G[0];
  g.lineWidth = 2;
  g.stroke();
  g.beginPath();
  g.moveTo(380, FLOOR - 14);
  g.quadraticCurveTo(410, FLOOR - 30, 440, FLOOR - 14);
  g.stroke();
  g.fillStyle = G[1];
  g.beginPath();
  g.arc(370, 88, 34, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = G[5];
  g.beginPath();
  g.arc(370, 88, 26, 0, Math.PI * 2);
  g.fill();
  // Vignettage.
  const vg = g.createRadialGradient(CW / 2, CH / 2, 120, CW / 2, CH / 2, 330);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.55)');
  g.fillStyle = vg;
  g.fillRect(0, 0, CW, CH);
  return c;
}

/* ───────────── Le coach ───────────── */

function glove(g: CanvasRenderingContext2D, x: number, y: number, a: number, s = 1) {
  g.save();
  g.translate(x, y);
  g.rotate(a);
  g.scale(s, s);
  const parts = (fn: (dx: number, dy: number, r: number) => void) => {
    fn(0, 0, 8);
    fn(7, -5, 4);
    fn(9, 0, 4);
    fn(7, 5, 4);
    fn(-2, -8, 3.6);
  };
  g.fillStyle = INK;
  parts((dx, dy, r) => (g.beginPath(), g.arc(dx, dy, r + 2.4, 0, Math.PI * 2), g.fill()));
  g.fillStyle = '#ffffff';
  parts((dx, dy, r) => (g.beginPath(), g.arc(dx, dy, r, 0, Math.PI * 2), g.fill()));
  g.restore();
}

function shoe(g: CanvasRenderingContext2D, x: number, y: number, toward: number) {
  g.save();
  g.translate(x, y);
  g.fillStyle = INK;
  g.beginPath();
  g.ellipse(toward * 7, -3, 15, 9, 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#f4f1ea';
  g.fillRect(toward * 7 - 15, 2, 30, 4);
  g.fillStyle = 'rgba(255,255,255,0.5)';
  g.beginPath();
  g.ellipse(toward * 7 - 3, -7, 5, 2.4, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** Tuyau souple : une seule courbe de l'épaule à la main (le coude est le point de contrôle). */
function hose(g: CanvasRenderingContext2D, a: Pt, mid: Pt, b: Pt, w: number) {
  g.strokeStyle = INK;
  g.lineWidth = w;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(a[0], a[1]);
  // Point de contrôle qui fait passer la courbe par le coude.
  g.quadraticCurveTo(2 * mid[0] - (a[0] + b[0]) / 2, 2 * mid[1] - (a[1] + b[1]) / 2, b[0], b[1]);
  g.stroke();
}

function pieEye(g: CanvasRenderingContext2D, x: number, y: number, look: number, blink: boolean) {
  g.fillStyle = '#fff';
  g.strokeStyle = INK;
  g.lineWidth = 2;
  g.beginPath();
  g.ellipse(x, y, 6, 8, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  if (blink) {
    g.beginPath();
    g.moveTo(x - 5, y);
    g.lineTo(x + 5, y);
    g.stroke();
    return;
  }
  const a = -Math.PI / 4;
  g.fillStyle = INK;
  g.beginPath();
  g.moveTo(x + look * 2, y + 1);
  g.ellipse(x + look * 2, y + 1, 3.8, 5.8, 0, a + 0.32, a - 0.32 + Math.PI * 2);
  g.closePath();
  g.fill();
}

export interface CoachFrame {
  pose: PoseName;
  /** Temps du mouvement (s), avancé seulement pendant l'exercice. */
  t: number;
  /** Horloge continue (scintillement de la pellicule, clignements). */
  clock: number;
  still?: boolean;
}

export function createHoseCoach(res = 2) {
  const gym = makeGym(res);
  return {
    render(g: CanvasRenderingContext2D, f: CoachFrame) {
      // Sur les deux : la pose change 12 fois par seconde.
      const tq = f.still ? f.t : Math.floor(f.t * 12) / 12;
      const boil = Math.floor(f.clock * 12) % 3;
      const def = POSES[f.pose];
      const u = (1 - Math.cos((Math.PI * tq) / def.tempo)) / 2;
      const angles = lerpAngles(full(def.frames[0]), full(def.frames[1]), u);
      const sk = skeleton(angles);
      const facing = facingOf(f.pose);
      const toward = facing === 'droite' ? 1 : facing === 'gauche' ? -1 : 0;
      const j = (p: Pt, i: number): Pt => {
        const x = CW / 2 + (p[0] - 100) * K,
          y = FLOOR + (p[1] - 186) * K;
        return [x + (hash(i, boil) - 0.5) * 1.6, y + (hash(i, boil, 1) - 0.5) * 1.6];
      };
      const P = {
        hip: j(sk.hip, 1),
        neck: j(sk.neck, 2),
        head: j(sk.head, 3),
        eL: j(sk.elbowL, 4),
        hL: j(sk.handL, 5),
        eR: j(sk.elbowR, 6),
        hR: j(sk.handR, 7),
        kL: j(sk.kneeL, 8),
        fL: j(sk.footL, 9),
        kR: j(sk.kneeR, 10),
        fR: j(sk.footR, 11)
      };

      g.save();
      g.drawImage(gym, 0, 0, CW, CH);
      // Ombre au sol, plus petite quand il saute.
      const air = Math.max(0, FLOOR - Math.max(P.fL[1], P.fR[1]));
      g.fillStyle = `rgba(0,0,0,${0.3 - Math.min(0.2, air / 120)})`;
      g.beginPath();
      g.ellipse((P.fL[0] + P.fR[0]) / 2, FLOOR + 4, 42 - Math.min(20, air / 3), 8, 0, 0, Math.PI * 2);
      g.fill();

      // Membres du fond d'abord (de profil, le côté gauche est derrière), puis le corps, puis l'avant.
      const legL = () => {
        hose(g, P.hip, P.kL, P.fL, 10);
        shoe(g, P.fL[0], P.fL[1], toward || -1);
      };
      const legR = () => {
        hose(g, P.hip, P.kR, P.fR, 10);
        shoe(g, P.fR[0], P.fR[1], toward || 1);
      };
      const armL = () => {
        hose(g, P.neck, P.eL, P.hL, 8);
        glove(g, P.hL[0], P.hL[1], Math.atan2(P.hL[1] - P.eL[1], P.hL[0] - P.eL[0]));
      };
      const armR = () => {
        hose(g, P.neck, P.eR, P.hR, 8);
        glove(g, P.hR[0], P.hR[1], Math.atan2(P.hR[1] - P.eR[1], P.hR[0] - P.eR[0]));
      };
      const torso = () => {
        const dx = P.neck[0] - P.hip[0],
          dy = P.neck[1] - P.hip[1];
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len,
          ny = dx / len;
        const wHip = 21,
          wNeck = 17;
        const shape = () => {
          g.beginPath();
          g.moveTo(P.hip[0] + nx * wHip, P.hip[1] + ny * wHip);
          g.quadraticCurveTo(P.hip[0] + dx * 0.5 + nx * (wHip + 4), P.hip[1] + dy * 0.5 + ny * (wHip + 4), P.neck[0] + nx * wNeck, P.neck[1] + ny * wNeck);
          g.lineTo(P.neck[0] - nx * wNeck, P.neck[1] - ny * wNeck);
          g.quadraticCurveTo(P.hip[0] + dx * 0.5 - nx * (wHip + 4), P.hip[1] + dy * 0.5 - ny * (wHip + 4), P.hip[0] - nx * wHip, P.hip[1] - ny * wHip);
          g.closePath();
        };
        shape();
        g.fillStyle = '#e0383b';
        g.fill();
        // Short bleu sur le bas du corps, bande d'ombre dure côté opposé à la lumière.
        g.save();
        shape();
        g.clip();
        g.fillStyle = '#3567de';
        g.beginPath();
        g.arc(P.hip[0], P.hip[1], len * 0.34, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(0,0,0,0.22)';
        g.beginPath();
        g.moveTo(P.hip[0] + nx * 8, P.hip[1] + ny * 8);
        g.lineTo(P.neck[0] + nx * 6, P.neck[1] + ny * 6);
        g.lineTo(P.neck[0] + nx * 30, P.neck[1] + ny * 30);
        g.lineTo(P.hip[0] + nx * 30, P.hip[1] + ny * 30);
        g.closePath();
        g.fill();
        g.restore();
        shape();
        g.strokeStyle = INK;
        g.lineWidth = 3;
        g.stroke();
      };
      const head = () => {
        const [x, y] = P.head;
        const r = 26;
        g.fillStyle = INK;
        for (const s of toward ? [-toward] : [-1, 1]) {
          g.beginPath();
          g.arc(x + s * (r - 2), y + 2, 7, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = '#f6d3b0';
        g.beginPath();
        g.arc(x, y, r, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = INK;
        g.lineWidth = 3;
        g.stroke();
        // Casquette rouge, visière du côté du regard.
        g.fillStyle = '#e0383b';
        g.beginPath();
        g.arc(x, y - 4, r + 1, Math.PI * 1.05, Math.PI * 1.95);
        g.closePath();
        g.fill();
        g.stroke();
        g.beginPath();
        g.ellipse(x + (toward || 1) * 20, y - 8, 15, 5, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        const blink = (f.clock % 3.4) < 0.12;
        const ex = toward * 9;
        pieEye(g, x - 8 + ex, y + 2, toward, blink);
        pieEye(g, x + 8 + ex, y + 2, toward, blink);
        g.strokeStyle = INK;
        g.lineWidth = 2.6;
        g.beginPath();
        g.arc(x + ex, y + 12, 8, 0.25, Math.PI - 0.25);
        g.stroke();
      };
      if (toward > 0) {
        armL();
        legL();
        torso();
        legR();
        head();
        armR();
      } else if (toward < 0) {
        armR();
        legR();
        torso();
        legL();
        head();
        armL();
      } else {
        legL();
        legR();
        torso();
        armL();
        armR();
        head();
      }

      // Pellicule : scintillement, rayures, poussières.
      if (!f.still) {
        const fr = Math.floor(f.clock * 24);
        g.fillStyle = `rgba(0,0,0,${hash(fr, 1) * 0.07})`;
        g.fillRect(0, 0, CW, CH);
        const seg = Math.floor(f.clock * 1.3);
        for (let i = 0; i < Math.floor(hash(seg, 2) * 3); i++) {
          const x = 30 + hash(seg, i, 3) * (CW - 60) + Math.sin(f.clock * 3 + i) * 3;
          g.strokeStyle = hash(seg, i, 4) > 0.5 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)';
          g.lineWidth = 0.8;
          g.beginPath();
          g.moveTo(x, 0);
          g.lineTo(x + 2, CH);
          g.stroke();
        }
        for (let i = 0; i < 3 + Math.floor(hash(fr, 7) * 5); i++) {
          g.fillStyle = hash(fr, i, 8) > 0.6 ? 'rgba(255,255,255,0.6)' : 'rgba(10,8,6,0.6)';
          g.beginPath();
          g.arc(hash(fr, i, 9) * CW, hash(fr, i, 10) * CH, 0.6 + hash(fr, i, 11) * 1.6, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.restore();
    },
    dispose() {
      gym.width = 0;
      gym.height = 0;
    }
  };
}
