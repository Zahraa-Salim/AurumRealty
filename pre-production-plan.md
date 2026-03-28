# Aurum Realty — Pre-Production Plan
## Seed · README · .env · Fallback Data · Production Checklist

---

## 1. SEED FILE — What to change

The current `prisma/seed.sql` is mostly correct but needs the following updates to exactly match the live schema.

### Missing column: `permissionsVersion`

The `User` INSERT does not include `permissionsVersion`. The column exists in the schema with `DEFAULT 0`, so it does not cause a crash, but it should be explicit.

**Change the User INSERT from:**
```sql
INSERT INTO "User" (name, email, password, role, "isActive", "createdAt", "lastActive")
```
**To:**
```sql
INSERT INTO "User" (name, email, password, role, "permissionsVersion", "isActive", "createdAt", "lastActive")
```
And add `0,` as a value for each user row.

### Missing SiteContent keys

The seed only inserts `home_hero`, `about_story`, `service_1`, `service_2`, `service_3`. The following keys are used by the application but have no seed row, so the DB is empty for them and the app falls back to hardcoded defaults. That is acceptable but the seed should be complete. Add these rows to the `SiteContent` INSERT block:

| Key | What it controls |
|---|---|
| `home_services` | Services section heading/subtitle on home page |
| `home_about` | About section on home page |
| `home_cta` | Bottom CTA section on home page |
| `home_journal` | Journal teaser label and button text |
| `services_header` | Services page heading and subtitle |
| `services_index` | Ordered list of service keys (enables dynamic add/delete) |
| `services_cta` | CTA at bottom of services page |
| `site_settings_general` | Company name, phone, email, address (used by footer + contact page) |
| `site_settings_hours` | Office hours (used by footer + contact page) |
| `site_settings_social` | Social media links (used by footer) |
| `contact_page` | Contact page heading and subtitle |

For `services_index`, the body must be valid JSON: `'{"keys":["service_1","service_2","service_3"]}'`

For `site_settings_general`, body is JSON: `'{"companyName":"Aurum Realty","tagline":"Luxury properties for discerning buyers.","contactEmail":"hello@aurumrealty.com","phone":"+1 (555) 123-4567","addressLines":["123 Luxury Avenue","Suite 400","New York, NY 10022"]}'`

For `site_settings_hours`, body is JSON with a `rows` array matching the `SiteSettingsHoursContent` type.

For `site_settings_social`, body is JSON with a `links` array: `'{"links":[{"label":"Instagram","url":"#"},{"label":"LinkedIn","url":"#"},{"label":"Facebook","url":"#"}]}'`

### Seed is safe to re-run

The Properties, BlogPost, and NewsArticle INSERTs already use `ON CONFLICT (slug) DO NOTHING` or `ON CONFLICT DO NOTHING`. The SiteContent block uses `ON CONFLICT (key) DO UPDATE SET` — meaning it will overwrite existing values. Change that to `ON CONFLICT (key) DO NOTHING` if you want to preserve any edits already made in the DB.

### Property seed: add `listingExpiresAt`

The Property INSERT does not include `listingExpiresAt`. It is nullable so it does not crash, but the dashboard stats count "expiring listings" using this field. Add `"listingExpiresAt"` to the INSERT columns with `NULL` as value for each property.

---

## 2. README — What to rewrite

The current README is good but too long on architecture and too short on setup. The monitor (or any new developer) needs to be able to run it from zero in under 10 minutes with no guesswork.

### What to keep

- Tech stack table (keep it, it's useful)
- Design system tokens table (keep at the bottom)
- Dashboard features section (keep but shorten)

### What to cut

- The full project directory tree (too long, not needed for setup)
- The database schema section (the schema file itself is the reference)
- The RBAC explanation section (move to a separate RBAC.md if needed)

### New README structure

```
# Aurum Realty

One-line description.

## What it does
3–4 bullet points about the public site and dashboard.

## Requirements
Node.js version, npm, Neon account.

## Local setup (numbered steps — see Section 3 below)

## Environment variables (table — only required vars)

## Running in development

## Deploying to Vercel (numbered steps)

## Default login
admin@aurumrealty.com / Password123!

## Design tokens (brief table)
```

The setup steps are written out fully in the new README below.

---

## 3. .ENV AND IMAGE UPLOADS — What to change

### The upload problem in production

**Why uploads fail on Vercel:**

Vercel runs Next.js as serverless functions. The filesystem is read-only except for `/tmp`. The local upload driver writes to `public/uploads/` which does not exist and cannot be created in a serverless environment. Any upload attempt silently fails or returns a 500 error.

The code in `lib/upload-storage.ts` is already correct — it has a full S3 driver. The problem is that `UPLOAD_STORAGE` is not set in production, and `S3_BUCKET` is also not set, so the auto-detection logic falls through to `local`. The file is never written and the upload fails.

**The fix: two options**

**Option A — Use S3-compatible storage (recommended for production)**

Set `UPLOAD_STORAGE=s3` and the five S3 variables in Vercel's environment settings. No code changes. Any of these services work:

- Cloudflare R2 (free 10GB/month, no egress fees — best choice)
- AWS S3 (pay per GB, most common)
- Backblaze B2 (cheapest)
- DigitalOcean Spaces

The code handles all of them identically via the AWS SDK. For Cloudflare R2, also set `S3_ENDPOINT` and `S3_FORCE_PATH_STYLE=true`.

**Option B — Use Vercel Blob (simplest, no separate account needed)**

Vercel has its own built-in storage called Vercel Blob. It requires changing the upload route to use `@vercel/blob` instead of the S3 SDK. This is a small code change but ties you to Vercel.

**Recommendation: Option A with Cloudflare R2.** Free tier, zero egress cost, works on any host not just Vercel, no lock-in, and no code changes needed.

### Can uploads work with `local` in production?

Only if you are running on a persistent server (a VPS like DigitalOcean Droplet, Railway, Render with a persistent disk, etc.) rather than Vercel's serverless functions. In that case `UPLOAD_STORAGE=local` works fine — files go to `public/uploads/` and are served as static assets. But on Vercel this is not possible.

### .env cleanup

The current `.env` has the live DATABASE_URL and NEXTAUTH_SECRET committed — this is a security issue. The `.env.local.example` is well-structured. Changes needed:

**`.env` — keep only these:**
```
DATABASE_URL=           # Neon connection string
NEXTAUTH_SECRET=        # JWT signing secret
NEXTAUTH_URL=           # http://localhost:3000 for local
UPLOAD_STORAGE=local    # explicit for local dev
```

Remove all S3 variables from `.env` — those only belong in `.env.local` or in Vercel's dashboard.

**`.env.local.example` — add one missing item:**

Add `UPLOAD_STORAGE=local` at the top of the upload section with a comment explaining it defaults to `local` in dev and `s3` in prod only if `S3_BUCKET` is set. This makes it clear to a new developer that they do not need any S3 config to run locally.

### next.config.ts — add localhost for local uploads

Currently `remotePatterns` only allows `images.unsplash.com` and the S3 public URL. Images uploaded locally (`/uploads/filename.jpg`) are served as relative paths — not via `next/image` — so they do not need a remote pattern. But if you ever use `<Image>` with a local upload URL, it will fail. This is low priority but worth noting.

---

## 4. FALLBACK DATA — Current state and what is already working

### What already works (no changes needed)

After inspecting every public page, the fallback pattern is already implemented correctly throughout the project. Every server component that fetches from the database wraps its Prisma call in `try {} catch {}`. On failure, it falls back to the values from `lib/site-content.ts`.

| Page / Component | What shows if DB is unreachable |
|---|---|
| Home `/` | Hero text, services section, about section, CTA — all show hardcoded defaults from `HOME_HERO_DEFAULTS`, `SERVICE_SECTION_DEFAULTS` etc. Empty properties grid, no journal teaser. |
| About `/about` | Full page renders from `ABOUT_STORY_DEFAULTS`, `ABOUT_TEAM_DEFAULTS`, `ABOUT_VALUES_DEFAULTS` |
| Services `/services` | All 3 default services from `SERVICE_SECTION_DEFAULTS` |
| Contact `/contact` | Page renders from `CONTACT_PAGE_DEFAULTS`, `SITE_SETTINGS_GENERAL_DEFAULTS` |
| Footer | Phone, email, address, hours, social all show from `DEFAULTS` object in `Footer.tsx` |
| Navigation | Static — no DB dependency |
| Properties list | Shows empty state "No properties found" — correct behaviour |
| Blog list | Shows empty state — correct behaviour |
| News list | Shows empty state — correct behaviour |

### One gap: footer tagline default is malformed

`components/Footer.tsx` line 22 — the `DEFAULTS.tagline` string contains multiple paragraphs joined with `\n` as a single string. The footer renders this in a `<p>` tag, meaning the line breaks appear as spaces rather than actual breaks. It displays as a very long run-on sentence.

**Fix:** Clean the default to a single clean tagline sentence: `'Founded 2010. Luxury properties for discerning buyers.'`

### What is intentionally not shown when DB is unreachable

Property cards, blog posts, and news articles all show empty states when DB is unreachable. This is correct — there is no sensible hardcoded fallback for live listings. The page structure and navigation still work, which is the important thing.

---

## 5. FINAL STEPS BEFORE PRODUCTION

In the exact order you should do them:

### Step 1 — Fix the three critical bugs (10 minutes)

**a)** `app/dashboard/services/page.tsx` line 54: change `['pages.services.edit']` → `['pages.edit']`

**b)** Copy `proxy.ts` to `middleware.ts`. Delete `proxy.ts`. This activates route-level RBAC.

**c)** Delete `app/api/blog/[slug]/route.ts` and `app/api/news/[slug]/route.ts` — these are unprotected legacy routes.

### Step 2 — Secure credentials (5 minutes)

**a)** Generate a new `NEXTAUTH_SECRET`: `openssl rand -base64 32`

**b)** Remove `.env` from git tracking: `git rm --cached .env` then `git commit -m "remove .env from tracking"`

**c)** Verify `.env` is in `.gitignore` (it is, but confirm)

**d)** Clean `.env` to keep only the three local-dev variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

### Step 3 — Set up image storage (30 minutes for Cloudflare R2)

**a)** Create a free [Cloudflare](https://cloudflare.com) account

**b)** Go to R2 → Create bucket → name it `aurum-realty-uploads`

**c)** In R2 settings: enable public access → copy the public URL

**d)** Create an API token with Object Read & Write permissions → copy Access Key ID and Secret

**e)** Add to `.env.local` for local testing:
```
UPLOAD_STORAGE=s3
S3_REGION=auto
S3_BUCKET=aurum-realty-uploads
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_ENDPOINT=https://ACCOUNT_ID.r2.cloudflarestorage.com
S3_FORCE_PATH_STYLE=true
S3_PUBLIC_URL=https://pub-HASH.r2.dev/
```

**f)** Test: upload an image in the dashboard locally — confirm it returns an `r2.dev` URL

### Step 4 — Update next.config.ts for R2 images (2 minutes)

If using Cloudflare R2 with a `pub-HASH.r2.dev` domain, add it to `remotePatterns`:
```ts
{
  protocol: 'https',
  hostname: '*.r2.dev',
  pathname: '/**',
}
```
Or if using a custom domain on R2, just set `S3_PUBLIC_URL` to that domain — `next.config.ts` already reads it automatically.

### Step 5 — Update the seed file (15 minutes)

Add `permissionsVersion` to User inserts. Add the missing SiteContent keys. Add `listingExpiresAt: NULL` to property inserts. Change `ON CONFLICT (key) DO UPDATE` to `ON CONFLICT (key) DO NOTHING` if you have live data you want to preserve.

### Step 6 — Clean up typo directory (1 minute)

Delete `app/publlic/` (the double-l directory). Files already exist correctly in `/public/`.

### Step 7 — Run a clean local build (10 minutes)

```bash
npm run build
```

Fix any TypeScript errors before deploying. Common things to catch: unused imports from deleted files, type errors in new features.

### Step 8 — Push to GitHub

```bash
git add .
git commit -m "pre-production cleanup"
git push origin main
```

Confirm `.env` is NOT in the commit (check `git status` before pushing).

### Step 9 — Import into Vercel

1. Go to [vercel.com](https://vercel.com) → Add New Project → import repo
2. Vercel auto-detects Next.js — no framework settings needed
3. Do NOT deploy yet — set environment variables first

### Step 10 — Set all Vercel environment variables

In Vercel → Project → Settings → Environment Variables. Add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_SECRET` | The new secret from Step 2a |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` (fill in after first deploy) |
| `UPLOAD_STORAGE` | `s3` |
| `S3_REGION` | `auto` (R2) or your AWS region |
| `S3_BUCKET` | `aurum-realty-uploads` |
| `S3_ACCESS_KEY_ID` | From Step 3d |
| `S3_SECRET_ACCESS_KEY` | From Step 3d |
| `S3_ENDPOINT` | R2 endpoint from Step 3e (skip for AWS) |
| `S3_FORCE_PATH_STYLE` | `true` (R2 only, skip for AWS) |
| `S3_PUBLIC_URL` | Your R2 public URL from Step 3c |

### Step 11 — Deploy

Click Deploy. Wait for build to complete.

### Step 12 — Apply database schema to production

Open the Neon SQL editor and run:

```sql
-- Apply any pending migrations
-- (or run: DATABASE_URL="..." npx prisma migrate deploy from your local terminal)
```

If you have not run migrations yet (fresh Neon DB), run `prisma migrate deploy` from your local machine pointing at the production DATABASE_URL. If the DB already has the tables (you've been using it), just ensure `permissionsVersion` exists:

```sql
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "permissionsVersion" INTEGER NOT NULL DEFAULT 0;
```

### Step 13 — Run the seed on production

In the Neon SQL editor, paste and run `prisma/seed.sql`. This creates the 4 users, 6 properties, 4 blog posts, 5 news articles, and all SiteContent defaults.

### Step 14 — Update NEXTAUTH_URL

After Vercel gives you your deployment URL (e.g. `https://aurum-realty.vercel.app`):
1. Go to Vercel → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to the exact production URL
3. Trigger a redeploy: Vercel → Deployments → Redeploy

### Step 15 — Smoke test the production deployment

- [ ] Visit the public site — home page loads with content
- [ ] Visit `/login` — sign in with `admin@aurumrealty.com` / `Password123!`
- [ ] Change the admin password immediately after login
- [ ] Upload an image in the dashboard — confirm it saves and shows
- [ ] Visit `/dashboard/services` — confirm no access-denied error (after Step 1a fix)
- [ ] Visit `/dashboard/users` without login — confirm redirect to `/login` (after Step 1b fix)
- [ ] Submit the contact form on the public site — confirm it saves to DB

### Step 16 — Set a custom domain (optional)

In Vercel → Settings → Domains → add your domain. Update `NEXTAUTH_URL` to the custom domain. Redeploy.
