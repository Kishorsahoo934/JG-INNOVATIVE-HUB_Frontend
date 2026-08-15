/**
 * Optional: the app uses public/assets/logo.png directly everywhere.
 * Run manually if you still want resized copies (logo-128 / logo-512) for other tools.
 * Requires: npm install -D sharp
 */
import { readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'public', 'assets');

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

const outputs = [
  { w: 128, name: 'logo-128' },
  { w: 512, name: 'logo-512' },
];

async function run() {
  let sharpMod;
  try {
    sharpMod = (await import('sharp')).default;
  } catch {
    console.warn('optimize-logo: sharp not installed. Run: npm install -D sharp');
    return;
  }

  const publicLogo = path.join(assetsDir, 'logo.png');
  const srcLogo = path.join(root, 'src', 'assets', 'logo.png');
  const inputPath = existsSync(publicLogo) ? publicLogo : srcLogo;

  if (!existsSync(inputPath)) {
    console.warn('optimize-logo: place your master file at public/assets/logo.png (or src/assets/logo.png), skipping.');
    return;
  }

  await mkdir(assetsDir, { recursive: true });
  const buf = await readFile(inputPath);
  const pipeline = sharpMod(buf);

  for (const { w, name } of outputs) {
    const webpPath = path.join(assetsDir, `${name}.webp`);
    const pngPath = path.join(assetsDir, `${name}.png`);
    await pipeline
      .clone()
      .resize(w, w, { fit: 'contain', background: transparent })
      .webp({ quality: 95, effort: 6 })
      .toFile(webpPath);
    await pipeline
      .clone()
      .resize(w, w, { fit: 'contain', background: transparent })
      .png({ compressionLevel: 4 })
      .toFile(pngPath);
    console.log('optimize-logo: wrote', name + '.webp', name + '.png');
  }
}

run().catch((err) => {
  console.error('optimize-logo:', err);
  process.exit(1);
});
