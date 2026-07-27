# Deploying to Cloudflare Pages

This site is a **Vite + React** static build, deployed to Cloudflare Pages at:

**https://rattanfurniture.ellines.co.ke**

---

## Prerequisites

1. GitHub repository with this code pushed to `main`
2. Cloudflare account with access to the **ellines.co.ke** zone
3. DNS managed in Cloudflare (required for custom subdomain)

---

## Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial Ellines Rattan Furniture site"
gh repo create ellines-rattan-furniture --public --source=. --push
```

If `gh` is not authenticated:

```bash
gh auth login
```

---

## Step 2 — Create Cloudflare Pages project

### Option A: Cloudflare Dashboard (recommended)

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select the `ellines-rattan-furniture` repository
4. Configure build settings:

| Setting | Value |
|---------|-------|
| **Production branch** | `main` |
| **Framework preset** | None (or Vite) |
| **Build command** | `npm run cf-build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` |

5. Click **Save and Deploy**

### Option B: Wrangler CLI

```bash
npm install
npx wrangler login
npx wrangler pages project create ellines-rattan-furniture --production-branch main
npm run build
npx wrangler pages deploy dist --project-name ellines-rattan-furniture
```

For ongoing deploys, connect GitHub in the dashboard (Option A) so pushes auto-deploy.

---

## Step 3 — Custom domain

1. In Cloudflare Pages → your project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `rattanfurniture.ellines.co.ke`
4. Cloudflare will create the DNS record automatically if `ellines.co.ke` is on the same account

### Manual DNS (if needed)

In the **ellines.co.ke** zone → **DNS** → **Add record**:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `rattanfurniture` | `<your-pages-project>.pages.dev` | Proxied (orange cloud) |

Example CNAME target: `ellines-rattan-furniture.pages.dev`

---

## Step 4 — Verify deployment

1. Visit `https://rattanfurniture.ellines.co.ke`
2. Check favicon, OG image, and gallery images load
3. Test WhatsApp link on mobile
4. Submit sitemap in Google Search Console:
   - Property: `https://rattanfurniture.ellines.co.ke`
   - Sitemap: `https://rattanfurniture.ellines.co.ke/sitemap.xml`

---

## Build reference

```bash
# Local production build
npm run cf-build

# Preview locally (after build)
npm run preview

# Preview with Wrangler (Cloudflare-like)
npm run preview:pages
```

### Environment variables

None required for the marketing site. All assets are static in `public/`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 404 on refresh | Ensure `public/_redirects` is deployed (`/* /index.html 200`) |
| Images missing | Confirm `public/images/` is committed |
| `pages.dev` indexed | Preview URLs auto-set `noindex` in `index.html` |
| SSL pending | Wait 5–15 min after DNS propagates; ensure CNAME is proxied |

---

## Related sites

- [haven.ellines.co.ke](https://haven.ellines.co.ke) — Ellines Haven (reference architecture)
- [tech.ellines.co.ke](https://tech.ellines.co.ke) — Ellines Group
