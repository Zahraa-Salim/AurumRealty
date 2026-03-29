# Aurum Realty

A full-stack luxury real estate platform built with Next.js, React, Prisma, and PostgreSQL.

## Features

- **Public website** — property listings, blog, news, about, services, and contact pages with bilingual English/Arabic support
- **Admin dashboard** — add/edit properties, blog posts, news articles, and manage all CMS page content
- **Dynamic RBAC** — role-based access control stored in the database; Super Admin can create custom roles with granular permissions without any code changes
- **Image uploads** — local disk in development, S3-compatible object storage in production (AWS S3, Cloudflare R2, DigitalOcean Spaces)
- **Submission inbox** — showing requests and contact form messages with status tracking
- **Site settings** — company info, office hours, and social links editable from the dashboard with live reflection on the public site

---

## Requirements

- **Node.js 18+** and npm
- A **[Neon](https://neon.tech) PostgreSQL database** — free tier is sufficient (10 GB storage)

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/your-username/aurum-realty.git
cd aurum-realty
npm install
```

### 2. Create a Neon database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Click **New project**, choose a region close to your users
3. On the project dashboard click **Connection Details**
4. Select **Prisma** from the framework dropdown and copy the connection string
   (it looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```env
DATABASE_URL="postgresql://..."          # From step 2
NEXTAUTH_SECRET="..."                    # Run: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

Everything else can stay commented out for local development.

### 4. Apply the database schema

```bash
npx prisma migrate deploy
```

### 5. Seed sample data

```bash
npx prisma db seed
```

This inserts 18 properties, 6 blog posts, 6 news articles, 4 users, and all CMS content rows.

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the admin dashboard.

**Default login** (change immediately after first login):
```
Email:    admin@aurumrealty.com
Password: Password123!
```

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Always | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Always | Random string for JWT signing — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Always | Full app URL, no trailing slash |
| `UPLOAD_STORAGE` | Optional | `local` (default in dev) or `s3` |
|

See `.env.local.example` for full documentation and S3 provider examples.

---

## Available scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19 · Tailwind CSS 4 |
| Language | TypeScript 5 |
| Database | PostgreSQL via [Neon](https://neon.tech) (serverless) |
| ORM | Prisma 6 |
| Auth | NextAuth.js 4 · bcryptjs · JWT sessions |
| Image uploads | Local disk (dev) · S3-compatible (prod) |
| Deployment | Vercel |

---

## Design tokens

| Token | Value | Usage |
|---|---|---|
| `--color-gold` | `#D4AF37` | Primary accent, CTAs, prices |
| `--color-charcoal` | `#1F1F1F` | Primary text, dark backgrounds |
| `--color-cream` | `#F5E6D3` | Section backgrounds |
| `--color-taupe` | `#7A7571` | Secondary text, inactive states |
| `--color-light-gray` | `#E8E6E1` | Borders, dividers |

Typography: Georgia serif for headings · System sans-serif for body text

---

## Role-based access control

Roles are named bundles of permission keys stored in the database — not hardcoded. At login, the user's permissions are embedded into the JWT; every dashboard page and API route checks them before proceeding.

**Built-in roles:**

| Role | Access |
|---|---|
| Super Admin | Everything |
| Property Manager | Properties + showing submissions |
| Editor | Blog + news |
| Support | View/update submissions only |

Super Admin can create custom roles with any of the 25 available permission keys through the dashboard — no code changes required.
