import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const publicDir = path.join(root, 'public')
const projectsDir = path.join(publicDir, 'images', 'projects')

const WATERMARK_CROPS = [
  {
    file: 'craftsmanship-weaving-chair-frame-workshop.jpg',
    cropBottom: 0.12,
    cropLeft: 0.22,
  },
  {
    file: 'craftsmanship-weaving-process-black-white-workshop.jpg',
    cropBottom: 0.12,
    cropLeft: 0.22,
  },
  {
    file: 'craftsmanship-armchair-weaving-overhead-workshop.jpg',
    cropBottom: 0.12,
    cropLeft: 0.22,
  },
]

async function cropWatermarks() {
  for (const item of WATERMARK_CROPS) {
    const filePath = path.join(projectsDir, item.file)
    const image = sharp(filePath)
    const meta = await image.metadata()
    const width = meta.width ?? 0
    const height = meta.height ?? 0
    const left = Math.round(width * item.cropLeft)
    const top = 0
    const cropWidth = width - left
    const cropHeight = Math.round(height * (1 - item.cropBottom))

    await image
      .extract({ left, top, width: cropWidth, height: cropHeight })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(filePath + '.tmp')

    const { rename } = await import('fs/promises')
    await rename(filePath + '.tmp', filePath)
    console.log(`Cropped watermark: ${item.file}`)
  }
}

async function generateFavicons() {
  const logo = path.join(publicDir, 'images', 'logos', 'ellines-rattan-logo-transparent.png')
  const sizes = [
    { name: 'favicon-16.png', size: 16 },
    { name: 'favicon-32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 192 },
  ]

  for (const { name, size } of sizes) {
    await sharp(logo)
      .resize(size, size, { fit: 'contain', background: { r: 10, g: 10, b: 15, alpha: 1 } })
      .png()
      .toFile(path.join(publicDir, name))
    console.log(`Generated ${name}`)
  }

  await sharp(logo)
    .resize(32, 32, { fit: 'contain', background: { r: 10, g: 10, b: 15, alpha: 1 } })
    .toFile(path.join(publicDir, 'favicon.ico'))

  const hero = path.join(publicDir, 'images', 'hero', 'living-set-brown-grey-checkered-showroom-wide.jpg')
  await sharp(hero)
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .composite([
      {
        input: await sharp(logo).resize(180, 180, { fit: 'contain' }).png().toBuffer(),
        gravity: 'southeast',
      },
    ])
    .png()
    .toFile(path.join(publicDir, 'og-image.png'))

  console.log('Generated favicon.ico and og-image.png')
}

await cropWatermarks()
await generateFavicons()
