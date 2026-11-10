/**
 * Fabrique les textures « fait main » des vidéos : public/texture-wash.jpg (lavis d'aquarelle)
 * et public/texture-grain.jpg (grain de papier). Bruit à graine fixe : le résultat est toujours identique.
 */
const sharp = require('../../node_modules/sharp');

const W = 1280;
const H = 720;

function mulberry(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Bruit lissé à plusieurs échelles, entre 0 et 1. */
function fractal(seed, cells) {
  const rand = mulberry(seed);
  const layers = cells.map((c) => {
    const w = Math.ceil(W / c) + 2;
    const h = Math.ceil(H / c) + 2;
    return { c, w, values: Float32Array.from({ length: w * h }, () => rand()) };
  });
  const smooth = (t) => t * t * (3 - 2 * t);
  const out = new Float32Array(W * H);
  let min = Infinity;
  let max = -Infinity;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = 0;
      let amp = 1;
      for (const { c, w, values } of layers) {
        const gx = x / c;
        const gy = y / c;
        const ix = Math.floor(gx);
        const iy = Math.floor(gy);
        const fx = smooth(gx - ix);
        const fy = smooth(gy - iy);
        const at = (a, b) => values[b * w + a];
        v += amp * ((at(ix, iy) * (1 - fx) + at(ix + 1, iy) * fx) * (1 - fy) + (at(ix, iy + 1) * (1 - fx) + at(ix + 1, iy + 1) * fx) * fy);
        amp *= 0.55;
      }
      out[y * W + x] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }
  }
  return out.map((v) => (v - min) / (max - min));
}

async function save(name, noise, low, high) {
  const raw = Buffer.alloc(W * H);
  for (let i = 0; i < raw.length; i++) raw[i] = Math.round(low + (high - low) * noise[i]);
  await sharp(raw, { raw: { width: W, height: H, channels: 1 } }).jpeg({ quality: 82 }).toFile(`public/${name}`);
}

(async () => {
  await save('texture-wash.jpg', fractal(7, [220, 90, 36]), 188, 255);
  await save('texture-grain.jpg', fractal(23, [3, 1.4]), 214, 255);
  console.log('textures prêtes');
})();
