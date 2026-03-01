import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const MAX_WIDTH = 1200;

const files = fs.readdirSync(PUBLIC_DIR);

for (const file of files) {
  const ext = path.extname(file).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

  const filePath = path.join(PUBLIC_DIR, file);
  const stat = fs.statSync(filePath);

  if (stat.size < 100 * 1024) continue;

  const buffer = fs.readFileSync(filePath);
  const metadata = await sharp(buffer).metadata();

  let pipeline = sharp(buffer);

  if (metadata.width > MAX_WIDTH) {
    pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
  }

  if (ext === '.png') {
    pipeline = pipeline.png({ quality: 80, effort: 4 });
  } else {
    pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
  }

  const output = await pipeline.toBuffer();
  fs.writeFileSync(filePath, output);

  const savings = ((stat.size - output.length) / stat.size * 100).toFixed(1);
  console.log(`${file}: ${(stat.size / 1024).toFixed(0)}KB -> ${(output.length / 1024).toFixed(0)}KB (${savings}% smaller)`);
}

console.log('\nDone!');
