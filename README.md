# Aurum Realty

A luxury real estate platform with a public-facing website and a private admin dashboard. Built with Next.js 16, Prisma 6, and PostgreSQL.

**Public site** — property listings, blog, news, about, services, contact form  
**Dashboard** — manage content, properties, submissions, users, and site settings  
**Auth** — JWT sessions with dynamic role-based access control (RBAC)

---

## Requirements

- Node.js 18 or higher
- npm 9 or higher
- A free [Neon](https://neon.tech) PostgreSQL account

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/your-username/aurum-realty.git
cd aurum-realty
npm install
```

### 2. Create the database

1. Go to [neon.tech](https://neon.tech) → Create account → New project
2. Name it `aurum-realty`
3. Copy the connection string — it looks like:
   `postgresql://user:password@host/db?sslmode=require`

### 3. Set environment variables

```bash
cp .env.local.example .env
```

Open `.env` and fill in the three required values:

```env
DATABASE_URL="postgresql://..."     # paste your Neon connection string here
NEXTAUTH_SECRET="..."               # generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

Leave all S3 variables empty for local development — uploads will save to `public/uploads/` automatically.

### 4. Apply the database schema

```bash
npx prisma migrate deploy
```

### 5. Seed the database

**Option A — using psql (if installed):**
```bash
psql $DATABASE_URL -f prisma/seed.sql
```

**Option B — using the Neon SQL editor:**
1. Open your Neon project → SQL Editor
2. Paste the contents of `prisma/seed.sql` and run it

The seed creates 4 users, 6 properties, 4 blog posts, 5 news articles, and all site content defaults.

### 6. Generate the Prisma client

```bash
npx prisma generate
```

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

**Default login:**
```
Email:    admin@aurumrealty.com
Password: Password123!
```
Change this password after your first login.

---

## Deploy to Vercel

### 1. Push to GitHub

Make sure `.env` is not committed:
```bash
git rm --cached .env   # only needed once if it was tracked
git add .
git commit -m "initial commit"
git push origin main
```

### 2. Create a Vercel project

Go to [vercel.com](https://vercel.com) → Add New Project → import your repository → do **not** deploy yet.

### 3. Set environment variables in Vercel

In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_SECRET` | New secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `UPLOAD_STORAGE` | `s3` |
| `S3_REGION` | `auto` (R2) or your AWS region |
| `S3_BUCKET` | Your bucket name |
| `S3_ACCESS_KEY_ID` | Your storage access key |
| `S3_SECRET_ACCESS_KEY` | Your storage secret |
| `S3_ENDPOINT` | R2 only: `https://ACCOUNT_ID.r2.cloudflarestorage.com` |
| `S3_FORCE_PATH_STYLE` | R2 only: `true` |
| `S3_PUBLIC_URL` | Your bucket public base URL |

> **Image uploads require S3-compatible storage on Vercel** — the local disk driver does not work in serverless environments. Cloudflare R2 is recommended (free 10 GB/month, no egress fees).

### 4. Deploy

Click Deploy in Vercel.

### 5. Apply the schema to the production database

From your local terminal:
```bash
DATABASE_URL="your-neon-prod-connection-string" npx prisma migrate deploy
```

Or in the Neon SQL editor:
```sql
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "permissionsVersion" INTEGER NOT NULL DEFAULT 0;
```

### 6. Run the seed on production

Paste `prisma/seed.sql` into the Neon SQL editor and run it.

### 7. Update NEXTAUTH_URL

After deploy, go to Vercel → Settings → Environment Variables → update `NEXTAUTH_URL` to your real URL → redeploy.

---

## Image Uploads

| Environment | How it works |
|---|---|
| Local dev | Saves to `public/uploads/` — no config needed |
| Production (Vercel) | Requires S3-compatible storage — set `UPLOAD_STORAGE=s3` and S3 vars |

Supported providers: **Cloudflare R2** · AWS S3 · DigitalOcean Spaces · Backblaze B2

Accepted formats: JPEG, PNG, WebP, GIF — max 10 MB (set `UPLOAD_MAX_SIZE_MB` to change)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Always | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Always | Random string — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Always | Full app URL, no trailing slash |
| `UPLOAD_STORAGE` | Optional | `local` (default in dev) or `s3` |
| `UPLOAD_MAX_SIZE_MB` | Optional | Upload size limit in MB, default `10` |
| `S3_REGION` | Production | AWS region or `auto` for Cloudflare R2 |
| `S3_BUCKET` | Production | Bucket name |
| `S3_ACCESS_KEY_ID` | Production | Storage access key |
| `S3_SECRET_ACCESS_KEY` | Production | Storage secret |
| `S3_PUBLIC_URL` | Production | Public base URL for uploaded files |
| `S3_ENDPOINT` | R2 / custom | Custom endpoint for non-AWS providers |
| `S3_FORCE_PATH_STYLE` | R2 | Set `true` for Cloudflare R2 |
| `S3_PREFIX` | Optional | Folder prefix inside the bucket |
| `RESEND_API_KEY` | Optional | Email notifications on form submissions |
| `RESEND_FROM_EMAIL` | Optional | Sender address for notifications |
| `RESEND_NOTIFICATION_TO` | Optional | Default recipient for all notifications |
| `CONTACT_NOTIFICATION_TO` | Optional | Recipient for contact form submissions |
| `SHOWINGS_NOTIFICATION_TO` | Optional | Recipient for showing requests |

---

## Scripts

```bash
npm run dev          # Development server (Turbopack)
npm run dev:webpack  # Development server (Webpack — use on Windows if Turbopack errors)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run check:launch # Pre-launch environment variable check
```

---

## Roles

| Role | What they can do |
|---|---|
| Super Admin | Everything — content, users, roles, settings |
| Property Manager | Properties + showing requests |
| Editor | Blog + news posts |
| Support | View and update submissions only |

Super Admin can create custom roles with any permissions from the dashboard — no code changes needed.

---

## Design Tokens

| Token | Value | Used for |
|---|---|---|
| `--color-gold` | `#D4AF37` | Buttons, accents, prices |
| `--color-charcoal` | `#1F1F1F` | Primary text, dark backgrounds |
| `--color-cream` | `#F5E6D3` | Section backgrounds, sidebar |
| `--color-taupe` | `#7A7571` | Secondary text |
| `--color-light-gray` | `#E8E6E1` | Borders, dividers |

Headings: Georgia serif · Body: system sans-serif

---

## License

Private — all rights reserved.
