/**
 * Kits de style — géométrie commune.
 * Tout ce que les kits dessinent est décrit une seule fois en polygones et en traits (« formes »),
 * avec sa couleur naturelle et son rôle. Chaque matière (crayon, cartoon années 30, pop-up, ombres,
 * briques, tableau blanc, aquarelle) interprète ensuite ces formes à sa façon.
 */
export type Pt = [number, number];

/**
 * Rôle d'une forme : c'est lui qui dit à la matière comment la traiter.
 *  - body : grande surface d'un objet ou d'un personnage (coloriée, contour appuyé) ;
 *  - part : surface secondaire (vêtement, tache, pétale…), coloriée, contour léger ;
 *  - line : trait seul (bouche, tige, rayon, ficelle) ;
 *  - dot : petit point plein (œil, bouton) — un trou de lumière au théâtre d'ombres ;
 *  - sky : grand aplat de fond (ciel, mur, sol), jamais cerné.
 */
export type Role = 'body' | 'part' | 'line' | 'dot' | 'sky';

export interface Shape {
  pts: Pt[];
  closed: boolean;
  color: string;
  role: Role;
  /** Épaisseur des traits (repère logique). */
  width?: number;
}

export interface Figure {
  shapes: Shape[];
  /** Même figure → même main (tremblé, hachures, taches). */
  seed: number;
  /** Fond (décor) ou devant (personnages, objets). */
  layer: 'back' | 'front';
  /** Personnage : les matières qui le distinguent (aimant, marionnette…) le savent. */
  character?: boolean;
}

/* ───────────── Constructions ───────────── */

export function ellipse(cx: number, cy: number, rx: number, ry: number, rot = 0, n = 26): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const x = Math.cos(a) * rx,
      y = Math.sin(a) * ry;
    return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)] as Pt;
  });
}

export const circle = (cx: number, cy: number, r: number, n = 24) => ellipse(cx, cy, r, r, 0, n);

export function rrect(x: number, y: number, w: number, h: number, r: number): Pt[] {
  r = Math.min(r, w / 2, h / 2);
  const out: Pt[] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 4; i++) {
      const a = a0 + (i / 4) * (Math.PI / 2);
      out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  return out;
}

export function arc(cx: number, cy: number, r: number, a0: number, a1: number, n = 12, ry = r): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * ry] as Pt;
  });
}

/** Courbe de Bézier quadratique échantillonnée. */
export function quad(p0: Pt, c: Pt, p1: Pt, n = 12): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n,
      v = 1 - u;
    return [v * v * p0[0] + 2 * v * u * c[0] + u * u * p1[0], v * v * p0[1] + 2 * v * u * c[1] + u * u * p1[1]] as Pt;
  });
}

export function cubic(p0: Pt, c1: Pt, c2: Pt, p1: Pt, n = 16): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n,
      v = 1 - u;
    const a = v * v * v,
      b = 3 * v * v * u,
      c = 3 * v * u * u,
      d = u * u * u;
    return [a * p0[0] + b * c1[0] + c * c2[0] + d * p1[0], a * p0[1] + b * c1[1] + c * c2[1] + d * p1[1]] as Pt;
  });
}

export function star(cx: number, cy: number, r1: number, r2: number, rot = 0, n = 5): Pt[] {
  return Array.from({ length: n * 2 }, (_, i) => {
    const a = -Math.PI / 2 + rot + (i * Math.PI) / n;
    const r = i % 2 ? r2 : r1;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as Pt;
  });
}

export function rotate(pts: Pt[], a: number, cx = 0, cy = 0): Pt[] {
  const c = Math.cos(a),
    s = Math.sin(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c] as Pt);
}

export const move = (pts: Pt[], dx: number, dy: number): Pt[] => pts.map(([x, y]) => [x + dx, y + dy] as Pt);

/** Ruban épais autour d'une ligne (pour les membres, les tiges épaisses). */
export function ribbon(path: Pt[], w: number): Pt[] {
  const left: Pt[] = [],
    right: Pt[] = [];
  path.forEach((p, i) => {
    const q = path[Math.min(i + 1, path.length - 1)],
      o = path[Math.max(i - 1, 0)];
    const dx = q[0] - o[0],
      dy = q[1] - o[1];
    const l = Math.hypot(dx, dy) || 1;
    left.push([p[0] - (dy / l) * (w / 2), p[1] + (dx / l) * (w / 2)]);
    right.push([p[0] + (dy / l) * (w / 2), p[1] - (dx / l) * (w / 2)]);
  });
  // Bouts arrondis.
  const end = path[path.length - 1],
    start = path[0];
  const aEnd = Math.atan2(end[1] - path[Math.max(0, path.length - 2)][1], end[0] - path[Math.max(0, path.length - 2)][0]);
  const aStart = Math.atan2(start[1] - path[1][1], start[0] - path[1][0]);
  return [...left, ...arc(end[0], end[1], w / 2, aEnd + Math.PI / 2, aEnd - Math.PI / 2, 6).slice(1, -1), ...right.reverse(), ...arc(start[0], start[1], w / 2, aStart + Math.PI / 2, aStart - Math.PI / 2, 6).slice(1, -1)];
}

/* ───────────── Formes ───────────── */

export const body = (pts: Pt[], color: string): Shape => ({ pts, closed: true, color, role: 'body' });
export const part = (pts: Pt[], color: string): Shape => ({ pts, closed: true, color, role: 'part' });
export const sky = (pts: Pt[], color: string): Shape => ({ pts, closed: true, color, role: 'sky' });
export const dot = (pts: Pt[], color: string): Shape => ({ pts, closed: true, color, role: 'dot' });
export const line = (pts: Pt[], color: string, width = 3): Shape => ({ pts, closed: false, color, role: 'line', width });

export interface Place {
  x: number;
  y: number;
  s?: number;
  rot?: number;
  /** Étirement horizontal (−1 = retourné). */
  sx?: number;
  sy?: number;
}

/** Place une figure dans la scène (les matières travaillent toujours en coordonnées de scène). */
export function place(fig: Figure, p: Place): Figure {
  const s = p.s ?? 1,
    sx = (p.sx ?? 1) * s,
    sy = (p.sy ?? 1) * s;
  const c = Math.cos(p.rot ?? 0),
    sn = Math.sin(p.rot ?? 0);
  const tf = ([x, y]: Pt): Pt => {
    const X = x * sx,
      Y = y * sy;
    return [p.x + X * c - Y * sn, p.y + X * sn + Y * c];
  };
  const ws = Math.abs(s);
  return { ...fig, shapes: fig.shapes.map((sh) => ({ ...sh, pts: sh.pts.map(tf), width: sh.width !== undefined ? sh.width * ws : undefined })) };
}

export function bbox(fig: Figure) {
  let x0 = Infinity,
    y0 = Infinity,
    x1 = -Infinity,
    y1 = -Infinity;
  for (const s of fig.shapes)
    for (const [x, y] of s.pts) {
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  return { x0, y0, x1, y1 };
}

export function pathPts(g: CanvasRenderingContext2D, pts: Pt[], closed: boolean) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  if (closed) g.closePath();
}

/** Couleur → gris de même valeur (le cartoon des années 30 garde ses décors en noir et blanc). */
export function grey(hex: string, lift = 0): string {
  const n = parseInt(hex.slice(1, 7), 16);
  const r = n >> 16,
    g = (n >> 8) & 255,
    b = n & 255;
  const v = Math.round(Math.min(255, (0.3 * r + 0.59 * g + 0.11 * b) * (1 - lift) + 255 * lift));
  // Rampe de gris chaude.
  return `rgb(${v},${Math.round(v * 0.97)},${Math.round(v * 0.92)})`;
}

export function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1, 7), 16);
  const f = (c: number) => Math.round(Math.max(0, Math.min(255, k > 0 ? c + (255 - c) * k : c * (1 + k))));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
