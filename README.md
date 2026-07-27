# Ellines Rattan Furniture

Marketing website for **Ellines Rattan Furniture** — handcrafted synthetic rattan furniture in Kenya.

**Live domain:** [rattanfurniture.ellines.co.ke](https://rattanfurniture.ellines.co.ke)

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) (static SPA, matching Ellines Haven)
- Cloudflare Pages for hosting
- Gold/black premium design with Playfair Display + Dancing Script

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5175](http://localhost:5175)

## Build

```bash
npm run build
npm run preview
```

Output directory: `dist/`

## Image assets

Curated images live in `public/images/` with manifest at `public/images/image-manifest.json`.

Regenerate favicons and crop craftsmanship watermarks:

```bash
npm run images:polish
```

## Deploy

See [DEPLOY.md](./DEPLOY.md) for Cloudflare Pages setup and custom domain instructions.

## Project structure

```
├── public/images/     # Hero, projects, logos
├── src/
│   ├── components/    # Navbar, Hero, About, Gallery, Services, Contact, Footer
│   └── data/          # Site copy and gallery metadata
├── scripts/           # Image polish (favicons, watermark crops)
├── index.html         # SEO meta tags & structured data
└── wrangler.toml      # Cloudflare Pages config
```

## Contact

- WhatsApp: [+254 748 255 466](https://wa.me/254748255466)
- Email: info@ellines.co.ke
- Location: Nairobi, Kenya
