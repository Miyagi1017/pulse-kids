/**
 * 🍓 « La Grosse Fraise Rouge » — style Shadow Puppetry.
 * Un écran de toile éclairé par des lampes chaudes : la lumière traverse les pièces découpées.
 * Modèle de rendu de la fiche : une toile « transmission » blanche où chaque pièce est posée en multiply
 * (les trous restent clairs, les chevauchements foncent tout seuls), multipliée par la lumière des lampes et la trame du tissu.
 * Une fourmi et une coccinelle tirent chacune de leur côté ; l'enfant touche la fraise pour la couper en deux.
 */
import { loop, type FilmAudio } from './audio';
import { H, W, back, clamp, easeInOut, easeOut, hash, lerp, span, type Film, type FilmScene, type FrameState } from './engine';
import { RES, canvas, ctx2d, wrap } from './crayon';

const STAGE = { x: 56, y: 22, w: 848, h: 440 };
const GROUND = 418;
/** Les insectes sont des marionnettes à l'échelle de la fraise géante. */
const BUG = 1.5;
const HIDE = 'rgba(38, 24, 15, 0.94)';
const HIDE_SOFT = 'rgba(38, 24, 15, 0.55)';
const RED = '#c8342a';
const LADY = '#d63a2c';
const GREEN = '#5a9a3c';
const STRAW = { x: 480, y: 330, w: 176, h: 184 };

/* ───────────── Toile, lampes, cadre (une fois) ───────────── */

function makeLamp() {
  const c = canvas();
  const g = ctx2d(c);
  g.fillStyle = '#1a0c06';
  g.fillRect(0, 0, W, H);
  // Un grand lobe et un point chaud plus serré (≈ 6:1), lumière chaude, jamais blanche.
  const lobe = g.createRadialGradient(480, 230, 30, 480, 250, 560);
  lobe.addColorStop(0, '#ffd28a');
  lobe.addColorStop(0.45, '#f4a24a');
  lobe.addColorStop(1, '#8a3d12');
  g.fillStyle = lobe;
  g.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);
  const hot = g.createRadialGradient(470, 210, 0, 470, 210, 200);
  hot.addColorStop(0, 'rgba(255,240,200,0.55)');
  hot.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = hot;
  g.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);
  return c;
}

/** Trame du tissu (sin × sin), petites fibres, taches de densité, bords plus sombres. */
function makeCloth() {
  const c = canvas();
  const g = c.getContext('2d')!;
  const img = g.createImageData(c.width, c.height);
  for (let y = 0; y < c.height; y++)
    for (let x = 0; x < c.width; x++) {
      const weave = 0.5 + 0.5 * Math.sin(x * 1.7) * Math.sin(y * 1.7);
      const blotch = 0.03 * (1 + Math.sin(x * 0.011 + Math.sin(y * 0.007) * 2) * Math.sin(y * 0.013 + 1));
      const fibre = hash(x, y) > 0.985 ? 0.08 : 0;
      const v = 255 * (1 - weave * 0.07 - blotch - fibre);
      const i = (y * c.width + x) * 4;
      img.data[i] = v;
      img.data[i + 1] = v * 0.97;
      img.data[i + 2] = v * 0.92;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  return c;
}

/** Cadre laqué autour de l'écran (avec la lumière qui déborde sur ses bords intérieurs) et vignettage chaud. */
function makeFrame() {
  const c = canvas();
  const g = ctx2d(c);
  g.fillStyle = '#2a110b';
  g.beginPath();
  g.rect(0, 0, W, H);
  g.roundRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h, 6);
  g.fill('evenodd');
  g.strokeStyle = '#c9a14a';
  g.lineWidth = 2;
  g.strokeRect(STAGE.x - 8, STAGE.y - 8, STAGE.w + 16, STAGE.h + 16);
  const spill = g.createLinearGradient(0, STAGE.y, 0, STAGE.y + 30);
  spill.addColorStop(0, 'rgba(255,170,80,0.0)');
  g.strokeStyle = 'rgba(255,170,80,0.35)';
  g.lineWidth = 4;
  g.strokeRect(STAGE.x - 3, STAGE.y - 3, STAGE.w + 6, STAGE.h + 6);
  const vig = g.createRadialGradient(480, 240, 220, 480, 240, 560);
  vig.addColorStop(0, 'rgba(60,20,0,0)');
  vig.addColorStop(1, 'rgba(60,20,0,0.55)');
  g.fillStyle = vig;
  g.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);
  return c;
}

/** Titre en marionnette : plaque de cuir sombre, lettres découpées (la lumière passe par les mots). */
function makeTitle() {
  const w = 560,
    h = 84;
  const c = canvas(Math.ceil(w * RES), Math.ceil(h * RES));
  const g = c.getContext('2d')!;
  g.setTransform(RES, 0, 0, RES, 0, 0);
  g.fillStyle = HIDE;
  g.beginPath();
  g.roundRect(0, 0, w, h, 14);
  g.fill();
  g.globalCompositeOperation = 'destination-out';
  g.font = '600 46px "Cormorant Garamond", serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('La Grosse Fraise Rouge', w / 2, h / 2 + 2);
  // Bordure ciselée : une rangée de petits trous.
  for (let x = 16; x < w - 10; x += 18) {
    for (const y of [9, h - 9]) {
      g.beginPath();
      g.arc(x, y, 2.6, 0, Math.PI * 2);
      g.fill();
    }
  }
  return { c, w, h };
}

/* ───────────── Marionnettes ───────────── */

/** Tremblement de la main du manipulateur : quelques px, basse fréquence, plus fort sous tension. */
function tremor(t: number, seed: number, k = 1) {
  return {
    x: (Math.sin(t * 1.7 + seed) + 0.5 * Math.sin(t * 3.1 + seed * 2)) * 1.6 * k,
    y: (Math.sin(t * 1.3 + seed * 3) + 0.5 * Math.sin(t * 2.9 + seed)) * 1.2 * k,
    a: Math.sin(t * 1.1 + seed) * 0.02 * k
  };
}

function rod(g: CanvasRenderingContext2D, x: number, y: number, lean = 0.12) {
  g.strokeStyle = HIDE;
  g.lineWidth = 2.2;
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x - (STAGE.y + STAGE.h + 20 - y) * lean, STAGE.y + STAGE.h + 20);
  g.stroke();
}

function legs(g: CanvasRenderingContext2D, xs: number[], top: number, ground: number, walk: number, dir: number) {
  g.strokeStyle = HIDE;
  g.lineWidth = 3.2;
  g.lineCap = 'round';
  xs.forEach((x, i) => {
    const sw = Math.sin(walk + i * 2.1) * 7;
    g.beginPath();
    g.moveTo(x, top);
    g.quadraticCurveTo(x + dir * 8 + sw * 0.5, top + 8, x + sw, ground);
    g.stroke();
  });
}

function antenna(g: CanvasRenderingContext2D, x: number, y: number, dir: number, sway: number) {
  g.strokeStyle = HIDE;
  g.lineWidth = 2.2;
  g.fillStyle = HIDE;
  for (const k of [0, 1]) {
    const tx = x + dir * (12 + k * 10) + sway * 4,
      ty = y - 26 + k * 6 + Math.abs(sway) * 2;
    g.beginPath();
    g.moveTo(x + dir * k * 4, y);
    g.quadraticCurveTo(x + dir * (4 + k * 6), y - 20, tx, ty);
    g.stroke();
    g.beginPath();
    g.arc(tx, ty, 3.4, 0, Math.PI * 2);
    g.fill();
  }
}

/** La fourmi, tournée vers la droite. Cuir sombre, abdomen ciselé de croissants (la lumière passe). */
function ant(g: CanvasRenderingContext2D, x: number, y: number, t: number, o: { walk: number; tilt: number; tension: number }) {
  const tr = tremor(t, 1, 1 + o.tension);
  g.save();
  g.translate(x + tr.x, y + tr.y);
  g.rotate(tr.a + o.tilt);
  g.scale(BUG, BUG);
  legs(g, [-30, -14, 4], -24, 0, o.walk, 1);
  g.fillStyle = HIDE;
  g.beginPath();
  g.ellipse(-36, -32, 28, 19, -0.15, 0, Math.PI * 2);
  // Croissants ciselés : trous dans l'abdomen.
  for (let i = 0; i < 3; i++) {
    g.moveTo(-50 + i * 13 + 4, -36);
    g.ellipse(-50 + i * 13, -36, 4, 7, 0, 0, Math.PI * 2);
  }
  g.fill('evenodd');
  g.beginPath();
  g.ellipse(-4, -32, 13, 10, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.arc(20, -44, 16, 0, Math.PI * 2);
  g.moveTo(28.5, -48);
  g.arc(25, -48, 3.6, 0, Math.PI * 2);
  g.fill('evenodd');
  antenna(g, 26, -58, 1, Math.sin(t * 2.3) * (1 + o.tension));
  g.restore();
  g.save();
  g.translate(x + tr.x, y + tr.y);
  g.rotate(tr.a + o.tilt);
  rod(g, -30 * BUG, -30 * BUG, 0.1);
  g.restore();
}

/** La coccinelle, tournée vers la gauche : carapace teinte en rouge (la lumière la traverse), points de cuir. */
function ladybug(g: CanvasRenderingContext2D, x: number, y: number, t: number, o: { walk: number; tilt: number; tension: number }) {
  const tr = tremor(t, 7, 1 + o.tension);
  g.save();
  g.translate(x + tr.x, y + tr.y);
  g.rotate(tr.a + o.tilt);
  g.scale(BUG, BUG);
  legs(g, [-22, -4, 14], -20, 0, o.walk, -1);
  g.fillStyle = LADY;
  g.beginPath();
  g.ellipse(0, -28, 44, 34, 0, Math.PI, 0);
  g.closePath();
  g.fill();
  g.fillStyle = HIDE;
  for (const [sx, sy, r] of [[-20, -38, 7], [6, -48, 7], [22, -32, 6.5], [-4, -30, 6]] as [number, number, number][]) {
    g.beginPath();
    g.arc(sx, sy, r, 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = HIDE;
  g.lineWidth = 3.4;
  g.beginPath();
  g.ellipse(0, -28, 44, 34, 0, Math.PI, 0);
  g.closePath();
  g.stroke();
  g.beginPath();
  g.moveTo(-6, -62);
  g.lineTo(-2, -28);
  g.stroke();
  g.beginPath();
  g.arc(-46, -26, 16, 0, Math.PI * 2);
  g.moveTo(-48.5, -30);
  g.arc(-52, -30, 3.6, 0, Math.PI * 2);
  g.fill('evenodd');
  antenna(g, -52, -38, -1, Math.sin(t * 2.1 + 1) * (1 + o.tension));
  g.restore();
  g.save();
  g.translate(x + tr.x, y + tr.y);
  rod(g, 0, -30 * BUG, -0.1);
  g.restore();
}

/* La fraise : teinte rouge, graines ciselées (petites larmes de lumière), couronne verte. */

function strawPath(g: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number) {
  g.moveTo(cx, cy + h / 2);
  g.bezierCurveTo(cx - w * 0.66, cy + h * 0.12, cx - w * 0.62, cy - h / 2, cx, cy - h * 0.4);
  g.bezierCurveTo(cx + w * 0.62, cy - h / 2, cx + w * 0.66, cy + h * 0.12, cx, cy + h / 2);
  g.closePath();
}

const SEEDS = Array.from({ length: 26 }, (_, i) => {
  const r = Math.floor(i / 5),
    c = i % 5;
  return { x: (c - 2) * 26 + (r % 2) * 13 + (hash(i, 1) - 0.5) * 6, y: -60 + r * 28 + (hash(i, 2) - 0.5) * 6 };
}).filter((p) => Math.abs(p.x) < 70 - Math.max(0, p.y) * 0.5);

function strawberry(g: CanvasRenderingContext2D, cx: number, cy: number, o: { scale?: number; half?: -1 | 1; bites?: number; seed?: number }) {
  const { w, h } = STRAW;
  const k = o.scale ?? 1;
  g.save();
  g.translate(cx, cy);
  g.scale(k, k);
  g.translate(-cx, -cy);
  if (o.half) {
    // Coupe en zigzag (la feuille-couteau), chaque moitié garde son bord.
    g.beginPath();
    const side = o.half;
    g.moveTo(cx, cy - h);
    for (let i = 0; i <= 10; i++) g.lineTo(cx + (i % 2 ? 5 : -5), cy - h / 2 + (i * h) / 10);
    g.lineTo(cx, cy + h);
    g.lineTo(cx + side * w, cy + h);
    g.lineTo(cx + side * w, cy - h);
    g.closePath();
    g.clip();
  }
  const bites = o.bites ?? 0;
  const bitePath = (pathOn: CanvasRenderingContext2D) => {
    for (let i = 0; i < bites; i++) {
      const bx = cx + (o.half ?? 1) * (w * 0.42 - i * 18),
        by = cy - 30 + i * 34;
      pathOn.moveTo(bx + 26, by);
      pathOn.arc(bx, by, 26, 0, Math.PI * 2);
    }
  };
  g.save();
  g.beginPath();
  strawPath(g, cx, cy, w, h);
  g.clip();
  // Graines et bouchées : des trous, la lumière passe.
  g.beginPath();
  strawPath(g, cx, cy, w, h);
  for (const sd of SEEDS) {
    g.moveTo(cx + sd.x + 3.2, cy + sd.y);
    g.ellipse(cx + sd.x, cy + sd.y, 3.2, 5.2, 0, 0, Math.PI * 2);
  }
  bitePath(g);
  g.fillStyle = RED;
  g.fill('evenodd');
  g.restore();
  g.save();
  if (bites > 0) {
    g.beginPath();
    g.rect(cx - w * 2, cy - h * 2, w * 4, h * 4);
    bitePath(g);
    g.clip('evenodd');
  }
  g.strokeStyle = HIDE;
  g.lineWidth = 3;
  g.beginPath();
  strawPath(g, cx, cy, w, h);
  g.stroke();
  g.restore();
  // Couronne de feuilles et queue.
  g.fillStyle = GREEN;
  const top = cy - h * 0.42;
  g.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = Math.PI + (i / 4) * Math.PI;
    g.moveTo(cx, top);
    g.quadraticCurveTo(cx + Math.cos(a - 0.3) * 40, top + 10 + Math.sin(a - 0.3) * -8, cx + Math.cos(a) * 52, top + 16);
    g.quadraticCurveTo(cx + Math.cos(a + 0.3) * 30, top + 18, cx, top);
  }
  g.fill();
  g.strokeStyle = HIDE;
  g.lineWidth = 2.2;
  g.stroke();
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(cx, top);
  g.quadraticCurveTo(cx + 4, top - 18, cx + 12, top - 26);
  g.stroke();
  g.restore();
}

function leafKnife(g: CanvasRenderingContext2D, x: number, y: number, a: number) {
  g.save();
  g.translate(x, y);
  g.rotate(a);
  g.fillStyle = GREEN;
  g.beginPath();
  g.ellipse(0, -40, 13, 40, 0, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = HIDE;
  g.lineWidth = 2.4;
  g.stroke();
  g.beginPath();
  g.moveTo(0, -78);
  g.lineTo(0, 4);
  g.stroke();
  g.restore();
}

function heart(g: CanvasRenderingContext2D, x: number, y: number, k: number) {
  g.save();
  g.translate(x, y);
  g.scale(k, k);
  g.fillStyle = RED;
  g.beginPath();
  g.moveTo(0, 26);
  g.bezierCurveTo(-46, -4, -26, -40, 0, -18);
  g.bezierCurveTo(26, -40, 46, -4, 0, 26);
  g.closePath();
  g.moveTo(10, -6);
  g.arc(0, -6, 10, 0, Math.PI * 2);
  g.fill('evenodd');
  g.strokeStyle = HIDE;
  g.lineWidth = 3;
  g.stroke();
  g.restore();
}

/** Bande de sol ciselée : herbes et petites fleurs découpées. */
function groundStrip(g: CanvasRenderingContext2D) {
  g.fillStyle = HIDE;
  g.beginPath();
  g.moveTo(STAGE.x, GROUND);
  for (let x = STAGE.x; x <= STAGE.x + STAGE.w; x += 8) g.lineTo(x, GROUND - 4 - (x % 24 === 0 ? 10 : 0) - Math.sin(x * 0.05) * 3);
  g.lineTo(STAGE.x + STAGE.w, STAGE.y + STAGE.h);
  g.lineTo(STAGE.x, STAGE.y + STAGE.h);
  g.closePath();
  for (let x = STAGE.x + 30; x < STAGE.x + STAGE.w; x += 64) {
    g.moveTo(x + 5, GROUND + 18);
    g.arc(x, GROUND + 18, 5, 0, Math.PI * 2);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      g.moveTo(x + 32 + Math.cos(a) * 9 + 3, GROUND + 26 + Math.sin(a) * 9);
      g.arc(x + 32 + Math.cos(a) * 9, GROUND + 26 + Math.sin(a) * 9, 3, 0, Math.PI * 2);
    }
  }
  g.fill('evenodd');
}

/* ───────────── Mise en scène ───────────── */

function staging(s: FrameState) {
  const end = s.end !== null;
  const bt = s.bt;
  let antX = 300,
    ladyX = 660,
    tension = 0,
    walkA = 0,
    walkL = 0,
    tiltA = 0,
    tiltL = 0;
  let strawX = STRAW.x,
    split = 0,
    cut: number | null = null,
    bites = 0,
    halves = s.beat >= 3 && (s.beat > 3 || s.sinceTap !== null),
    eaten = false,
    heartK = 0,
    strawPress = 1,
    lamps = 1;
  if (s.beat === 0) {
    const u = easeInOut(span(bt, 0.5, 3.2));
    antX = lerp(120, 300, u);
    ladyX = lerp(840, 660, u);
    walkA = walkL = u > 0 && u < 1 ? bt * 9 : 0;
    strawPress = 1 + 0.5 * (1 - easeOut(span(bt, 0, 0.5)));
  }
  if (s.beat === 1) {
    // On tire ! Chacune se penche en arrière, la fraise hésite.
    tension = 1.5;
    const pull = Math.sin(bt * 5);
    strawX = STRAW.x + pull * 12;
    antX = 300 + pull * 10 - 6;
    ladyX = 660 + pull * 10 + 6;
    tiltA = -0.12;
    tiltL = 0.12;
    walkA = walkL = bt * 14;
  }
  if (s.beat === 2) {
    // Pose figée sur le coup de gong, puis les têtes se tournent l'une vers l'autre.
    tension = bt < 1.1 ? 0.2 : 0;
    tiltA = bt < 1.1 ? -0.12 : lerp(-0.12, 0.08, easeOut(span(bt, 1.1, 1.6)));
    tiltL = bt < 1.1 ? 0.12 : lerp(0.12, -0.08, easeOut(span(bt, 1.1, 1.6)));
  }
  if (s.beat === 3) {
    tiltA = 0.08;
    tiltL = -0.08;
    if (s.sinceTap !== null) {
      cut = s.sinceTap;
      split = easeOut(span(s.sinceTap, 0.75, 1.5));
    }
  }
  if (s.beat >= 3 && s.beat !== 3) split = 1;
  if (s.beat === 4) {
    bites = Math.min(3, Math.floor(span(bt, 0.6, 3.0) * 3.99));
    walkA = walkL = 0;
  }
  if (s.beat >= 5 || end) {
    eaten = true;
    const u = end ? 1 : easeInOut(span(bt, 0.2, 1.6));
    antX = lerp(300, 438, u);
    ladyX = lerp(660, 528, u);
    walkA = walkL = u > 0 && u < 1 ? bt * 9 : 0;
    tiltA = lerp(0.08, 0.16, u);
    tiltL = lerp(-0.08, -0.16, u);
    heartK = end ? 1 : back(span(bt, 1.8, 2.4));
    lamps = end ? lerp(1, 0.55, easeInOut(span(s.end!, 0.5, 2.5))) : 1;
  }
  return { antX, ladyX, tension, walkA, walkL, tiltA, tiltL, strawX, split, cut, bites, halves, eaten, heartK, strawPress, lamps };
}

function create(): FilmScene {
  const lamp = makeLamp();
  const cloth = makeCloth();
  const frame = makeFrame();
  const title = makeTitle();
  const T = canvas();
  const buf = canvas();

  return {
    render(ctx, s) {
      const st = staging(s);
      const g = ctx2d(T);
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = 'source-over';
      g.fillStyle = '#fff';
      g.fillRect(0, 0, T.width, T.height);
      g.restore();
      g.globalCompositeOperation = 'multiply';

      groundStrip(g);
      // Titre en plaque, posé sur l'écran puis soulevé (il grandit, se floute et s'efface).
      if (s.beat === 0 && s.bt < 4.2) {
        const lift = span(s.bt, 3.4, 4.2);
        const press = 1 - easeOut(span(s.bt, 0, 0.5));
        const k = 1 + press * 0.3 + lift * 0.25;
        g.save();
        g.globalAlpha = 1 - lift;
        if (!s.still && (press > 0.05 || lift > 0.05)) g.filter = `blur(${(press + lift) * 6}px)`;
        g.translate(480, 82);
        g.scale(k, k);
        g.drawImage(title.c, -title.w / 2, -title.h / 2, title.w, title.h);
        g.restore();
        rod(g, 480, 82 + title.h / 2, 0.02);
      }

      // Fraise (entière, ou deux moitiés qui s'écartent, puis croquées).
      if (!st.eaten) {
        if (!st.halves) {
          g.save();
          if (!s.still && st.strawPress > 1.02) g.filter = `blur(${(st.strawPress - 1) * 10}px)`;
          strawberry(g, st.strawX, STRAW.y, { scale: st.strawPress });
          g.restore();
          rod(g, st.strawX + 30, STRAW.y + 40, 0.05);
        } else {
          for (const side of [-1, 1] as const) {
            const dx = side * (st.split * 70);
            g.save();
            g.translate(dx, 0);
            g.translate(STRAW.x, GROUND);
            g.rotate(side * st.split * 0.14);
            g.translate(-STRAW.x, -GROUND);
            strawberry(g, STRAW.x, STRAW.y, { half: side, bites: st.bites });
            g.restore();
            rod(g, STRAW.x + dx + side * 40, STRAW.y + 40, side * 0.05);
          }
        }
      }

      // La feuille-couteau : levée, puis coupe d'un geste (au toucher).
      if (st.cut !== null && st.cut < 1.6) {
        const up = easeOut(span(st.cut, 0, 0.35));
        const down = easeInOut(span(st.cut, 0.4, 0.7));
        const y = lerp(GROUND + 60, 150, up) + down * 230;
        g.save();
        if (st.cut > 1.2) g.globalAlpha = 1 - span(st.cut, 1.2, 1.6);
        leafKnife(g, STRAW.x + 4, y, lerp(0.5, 0, up));
        g.restore();
      }

      ant(g, st.antX, GROUND, s.t, { walk: st.walkA, tilt: st.tiltA, tension: st.tension });
      ladybug(g, st.ladyX, GROUND, s.t, { walk: st.walkL, tilt: st.tiltL, tension: st.tension });
      if (st.heartK > 0) {
        heart(g, 482, 250 - (s.end ?? 0) * 6, st.heartK);
        rod(g, 482, 276, 0.02);
      }

      // Image = lumière × transmission × toile.
      const B = ctx2d(buf);
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.globalCompositeOperation = 'source-over';
      B.drawImage(lamp, 0, 0);
      B.globalCompositeOperation = 'multiply';
      B.drawImage(T, 0, 0);
      B.drawImage(cloth, 0, 0);
      B.globalCompositeOperation = 'source-over';
      B.restore();
      // Lampes qui vacillent (quelques %), et moins de lampes = la nuit tombe (jamais de bleu ajouté).
      const flicker = s.still ? 0 : 0.05 * (0.5 + 0.5 * Math.sin(s.t * 7.3) * Math.sin(s.t * 3.1 + 1)) + 0.03 * hash(Math.floor(s.t * 14));
      B.fillStyle = `rgba(20,6,0,${clamp(flicker + (1 - st.lamps) * 0.75)})`;
      B.fillRect(STAGE.x, STAGE.y, STAGE.w, STAGE.h);
      B.save();
      B.setTransform(1, 0, 0, 1, 0, 0);
      B.drawImage(frame, 0, 0);
      B.restore();
      placard(B, s.caption);
      ctx.drawImage(buf, 0, 0, buf.width, buf.height, 0, 0, W, H);
    },
    cues(s, prev, audio) {
      const cross = (t: number) => prev < t && s.bt >= t;
      const at = audio.now;
      if (s.beat === 0) {
        if (cross(0.02)) audio.clapper(at);
        if (cross(0.05)) audio.thump(at, 0.5);
        for (let i = 0; i < 8; i++) if (cross(0.6 + i * 0.32)) audio.step(at);
      }
      if (s.beat === 1) for (let i = 0; i < 6; i++) if (cross(0.3 + i * 0.63)) audio.tone(110 + (i % 2) * 30, at, 0.25, { wave: 'triangle', gain: 0.12, to: 80, attack: 0.02 });
      if (s.beat === 2 && cross(0.08)) audio.gong(at, false, 1);
      if (s.beat === 3 && s.sinceTap !== null) {
        const p = prev - (s.bt - s.sinceTap);
        if (p < 0.45 && s.sinceTap >= 0.45) audio.noise(at, 0.25, { freq: 2600, to: 900, q: 1, gain: 0.12 });
        if (p < 0.75 && s.sinceTap >= 0.75) audio.clapper(at);
      }
      if (s.beat === 4) [0.6, 1.4, 2.2].forEach((t) => cross(t) && (audio.noise(at, 0.08, { freq: 1200, q: 2, gain: 0.1 }), audio.noise(at + 0.12, 0.08, { freq: 1000, q: 2, gain: 0.08 })));
      if (s.beat === 5) {
        if (cross(1.8)) audio.gong(at, true, 0.8);
        if (cross(2.0)) audio.chime(at, [74, 79, 83, 86]);
      }
    },
    onTap(_b, audio) {
      audio.gong(audio.now, true, 0.9);
    },
    dispose() {
      [lamp, cloth, frame, title.c, T, buf].forEach((c) => {
        c.width = 0;
        c.height = 0;
      });
    }
  };
}

/** Pancarte du conteur : planche laquée sombre, filet doré, petit sceau, texte crème. */
function placard(g: CanvasRenderingContext2D, text: string) {
  g.save();
  g.setTransform(RES, 0, 0, RES, 0, 0);
  g.font = '600 24px "Cormorant Garamond", serif';
  const lines = wrap(g, text, 720);
  const w = Math.max(...lines.map((l) => g.measureText(l).width)) + 70;
  const h = lines.length * 26 + 18;
  const x = 480 - w / 2,
    y = 501 - h / 2;
  g.fillStyle = '#1c0b06';
  g.beginPath();
  g.roundRect(x, y, w, h, 6);
  g.fill();
  g.strokeStyle = '#c9a14a';
  g.lineWidth = 1.2;
  g.strokeRect(x + 5, y + 5, w - 10, h - 10);
  g.fillStyle = '#b8342a';
  g.fillRect(x + 12, y + h / 2 - 7, 14, 14);
  g.fillStyle = '#f3e3c3';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, 480 + 8, y + h / 2 + (i - (lines.length - 1) / 2) * 26 + 1));
  g.restore();
}

/* Flûte pentatonique douce + petit tambour (originale). */
const FLUTE = [74, 0, 76, 0, 79, 0, 76, 74, 0, 0, 71, 0, 74, 0, 0, 0, 79, 0, 81, 0, 79, 76, 74, 0, 76, 0, 74, 71, 69, 0, 0, 0];

export const fraise: Film = {
  id: 'film-fraise',
  title: 'La Grosse Fraise Rouge',
  emoji: '🍓',
  style: 'shadow-puppet',
  styleLabel: 'Théâtre d’ombres',
  goal: 'Partager, régler une dispute sans se fâcher',
  mood: 'calme',
  poster: { beat: 5, bt: 2.6 },
  beats: [
    { text: 'Dans le jardin, une fourmi et une coccinelle trouvent une fraise géante !', min: 4.6, hold: 0.4 },
    { text: 'La fourmi tire de son côté… la coccinelle tire de l’autre ! Grrr !', min: 3.8, hold: 0.3 },
    { text: 'Soudain, elles s’arrêtent… et se regardent.', min: 2.6, hold: 0.6 },
    {
      text: 'Comment partager ? Touche la fraise pour la couper en deux !',
      hold: 1.8,
      tap: {
        hint: 'Touche la fraise',
        at: () => ({ x: STRAW.x, y: STRAW.y }),
        hit: (x, y) => Math.abs(x - STRAW.x) < STRAW.w * 0.62 && y > STRAW.y - STRAW.h * 0.6 && y < GROUND + 10
      }
    },
    { text: 'Une moitié pour toi, une moitié pour moi. Miam !', min: 3.4, hold: 0.4 },
    { text: 'Et elles se font un gros câlin d’ombres. Partager, c’est plus doux !', min: 3.6, hold: 1.8 }
  ],
  music(audio) {
    return loop(audio, 0.42, (step, at) => {
      const n = FLUTE[step % FLUTE.length];
      if (n) audio.flute(n, at, 0.5, 0.9);
      if (step % 8 === 0) audio.tone(98, at, 0.4, { wave: 'triangle', gain: 0.12, bus: 'music', to: 70, attack: 0.01 });
      if (step % 8 === 6) audio.woodblock(at, 0.25);
    });
  },
  create
};
