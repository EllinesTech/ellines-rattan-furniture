/**
 * Compose premium studio-style hero images from project photos.
 * Crops tightly on furniture, places on warm neutral gradients, adds soft shadow.
 * Originals in public/images/projects/ are never modified.
 */
import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const projectsDir = path.join(root, 'public', 'images', 'projects')
const heroDir = path.join(root, 'public', 'images', 'hero')

/** Warm luxury palette — sand, cream, soft taupe */
const GRADIENT_TOP = { r: 248, g: 244, b: 236 }
const GRADIENT_BOTTOM = { r: 228, g: 218, b: 200 }
const GRADIENT_MID = { r: 240, g: 232, b: 218 }

const HERO_WIDTH = 1920
const HERO_HEIGHT = 1280
const CARD_WIDTH = 1200
const CARD_HEIGHT = 900

/**
 * Per-source crop + placement tuned to each photo.
 * Regions are fractions of source dimensions (left, top, width, height).
 */
const COMPOSE_CONFIG = [
  {
    source: 'living-set-brown-grey-checkered-showroom-wide.jpg',
    output: 'hero-living-set-studio.jpg',
    region: { left: 0.02, top: 0.08, width: 0.96, height: 0.88 },
    heroSize: { width: HERO_WIDTH, height: HERO_HEIGHT },
    scale: 0.92,
    offsetY: 0.04,
    vignette: true,
  },
  {
    source: 'armchair-black-white-woven-shaggy-pillow.jpg',
    output: 'hero-armchair-studio.jpg',
    region: { left: 0.05, top: 0.02, width: 0.9, height: 0.94 },
    heroSize: { width: HERO_WIDTH, height: HERO_HEIGHT },
    scale: 0.78,
    offsetY: 0.06,
    vignette: true,
  },
  {
    source: 'bench-brown-rattan-shaggy-grey-pillows.jpg',
    output: 'hero-bench-studio.jpg',
    region: { left: 0.04, top: 0.06, width: 0.92, height: 0.88 },
    heroSize: { width: CARD_WIDTH, height: CARD_HEIGHT },
    scale: 0.82,
    offsetY: 0.05,
    vignette: true,
  },
  {
    source: 'cabinet-black-white-checkered-gold-legs.jpg',
    output: 'hero-cabinet-studio.jpg',
    region: { left: 0.06, top: 0.04, width: 0.88, height: 0.92 },
    heroSize: { width: CARD_WIDTH, height: CARD_HEIGHT },
    scale: 0.75,
    offsetY: 0.05,
    vignette: true,
  },
  {
    source: 'modular-sofa-white-grey-woven-showroom.jpg',
    output: 'hero-modular-sofa-studio.jpg',
    region: { left: 0.04, top: 0.06, width: 0.92, height: 0.88 },
    heroSize: { width: CARD_WIDTH, height: CARD_HEIGHT },
    scale: 0.8,
    offsetY: 0.05,
    vignette: true,
  },
]

async function createGradientBuffer(width, height) {
  const channels = width * height * 3
  const data = Buffer.alloc(channels)

  for (let y = 0; y < height; y++) {
    const t = y / (height - 1)
    // Subtle radial warmth at center-bottom
    for (let x = 0; x < width; x++) {
      const cx = (x / width - 0.5) * 1.4
      const cy = (y / height - 0.55) * 1.2
      const radial = Math.max(0, 1 - Math.sqrt(cx * cx + cy * cy))
      const vertical = t

      const r = Math.round(
        GRADIENT_TOP.r * (1 - vertical) + GRADIENT_BOTTOM.r * vertical + radial * 8
      )
      const g = Math.round(
        GRADIENT_TOP.g * (1 - vertical) + GRADIENT_BOTTOM.g * vertical + radial * 6
      )
      const b = Math.round(
        GRADIENT_TOP.b * (1 - vertical) + GRADIENT_BOTTOM.b * vertical + radial * 4
      )

      const i = (y * width + x) * 3
      data[i] = Math.min(255, r)
      data[i + 1] = Math.min(255, g)
      data[i + 2] = Math.min(255, b)
    }
  }

  return sharp(data, { raw: { width, height, channels: 3 } }).jpeg({ quality: 95 }).toBuffer()
}

async function createShadowBuffer(width, height, furnitureWidth, furnitureBottomY) {
  const shadowW = Math.round(furnitureWidth * 0.72)
  const shadowH = Math.round(furnitureWidth * 0.12)
  const cx = Math.round(width / 2)
  const cy = Math.min(height - 40, furnitureBottomY + 8)

  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <radialGradient id="sh" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="rgba(30,25,20,0.38)"/>
          <stop offset="55%" stop-color="rgba(30,25,20,0.14)"/>
          <stop offset="100%" stop-color="rgba(30,25,20,0)"/>
        </radialGradient>
      </defs>
      <ellipse cx="${cx}" cy="${cy}" rx="${shadowW / 2}" ry="${shadowH / 2}" fill="url(#sh)"/>
    </svg>`

  return sharp(Buffer.from(svg)).png().toBuffer()
}

async function extractFurniture(sourcePath, region) {
  const meta = await sharp(sourcePath).metadata()
  const w = meta.width ?? 0
  const h = meta.height ?? 0

  const extract = {
    left: Math.round(w * region.left),
    top: Math.round(h * region.top),
    width: Math.round(w * region.width),
    height: Math.round(h * region.height),
  }

  // Gentle edge soften via slight blur on alpha mask approach — use trim for tight bounds
  const cropped = await sharp(sourcePath).extract(extract).toBuffer()
  const trimmed = await sharp(cropped).trim({ threshold: 12 }).toBuffer()

  return trimmed
}

async function composeOne(config) {
  const sourcePath = path.join(projectsDir, config.source)
  const outPath = path.join(heroDir, config.output)
  const { width: outW, height: outH } = config.heroSize

  const furnitureRaw = await extractFurniture(sourcePath, config.region)
  const furnMeta = await sharp(furnitureRaw).metadata()

  const maxW = Math.round(outW * config.scale)
  const maxH = Math.round(outH * (config.scale - 0.08))
  const scale = Math.min(maxW / (furnMeta.width ?? 1), maxH / (furnMeta.height ?? 1))
  const targetW = Math.round((furnMeta.width ?? 1) * scale)
  const targetH = Math.round((furnMeta.height ?? 1) * scale)

  const furniture = await sharp(furnitureRaw)
    .resize(targetW, targetH, { fit: 'inside' })
    .modulate({ brightness: 1.04, saturation: 0.92 })
    .sharpen({ sigma: 0.6 })
    .toBuffer()

  const offsetX = Math.round((outW - targetW) / 2)
  const offsetY = Math.round(outH * config.offsetY + (outH - targetH - outH * config.offsetY) / 2)

  const bg = await createGradientBuffer(outW, outH)
  const shadow = await createShadowBuffer(outW, outH, targetW, offsetY + targetH)

  const layers = [
    { input: shadow, top: 0, left: 0 },
    { input: furniture, top: offsetY, left: offsetX },
  ]

  if (config.vignette) {
    const vignetteSvg = `
      <svg width="${outW}" height="${outH}">
        <defs>
          <radialGradient id="v" cx="50%" cy="45%" r="75%">
            <stop offset="55%" stop-color="rgba(0,0,0,0)"/>
            <stop offset="100%" stop-color="rgba(40,35,28,0.12)"/>
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#v)"/>
      </svg>`
    layers.push({ input: Buffer.from(vignetteSvg), top: 0, left: 0 })
  }

  await sharp(bg).composite(layers).jpeg({ quality: 90, mozjpeg: true }).toFile(outPath)
  console.log(`✓ ${config.output} (${outW}×${outH}) from ${config.source}`)
}

async function generateOgImage() {
  const heroPath = path.join(heroDir, 'hero-living-set-studio.jpg')
  const logoPath = path.join(root, 'public', 'images', 'logos', 'ellines-rattan-logo-transparent.png')

  await sharp(heroPath)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .composite([
      {
        input: await sharp(logoPath).resize(140, 140, { fit: 'contain' }).png().toBuffer(),
        gravity: 'southeast',
      },
    ])
    .png()
    .toFile(path.join(root, 'public', 'og-image.png'))

  console.log('✓ og-image.png updated from hero-living-set-studio.jpg')
}

await mkdir(heroDir, { recursive: true })

for (const config of COMPOSE_CONFIG) {
  await composeOne(config)
}

await generateOgImage()
console.log('Hero image composition complete.')
