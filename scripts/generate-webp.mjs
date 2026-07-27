/**
 * Generates WebP versions and responsive thumbnails for fast page loads.
 * Run: npm run images:webp
 */
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const root = path.resolve(import.meta.dirname, '..')
const publicDir = path.join(root, 'public')
const widths = [480, 640, 960, 1280, 1920]

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else if (/\.(jpe?g|png)$/i.test(entry.name)) files.push(full)
  }
  return files
}

async function optimizeImage(file) {
  const rel = path.relative(publicDir, file)
  const ext = path.extname(file)
  const base = file.slice(0, -ext.length)

  await sharp(file)
    .webp({ quality: 82 })
    .toFile(`${base}.webp`)

  for (const w of widths) {
    await sharp(file)
      .resize(w, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(`${base}-${w}w.webp`)
  }

  console.log(`Optimized: ${rel}`)
}

const imagesDir = path.join(publicDir, 'images')
const files = await walk(imagesDir)
console.log(`Processing ${files.length} images…`)

for (const file of files) {
  await optimizeImage(file)
}

console.log('Done — WebP and thumbnails ready.')
