# Aurum Realty

A full-stack luxury real estate platform built with Next.js 16, React 19, Prisma 6, and PostgreSQL. Features a public-facing website for clients and a private admin dashboard for the agency team with dynamic role-based access control.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router, Webpack mode) |
| Frontend | React 19 · Tailwind CSS 4 |
| Language | TypeScript 5 |
| Database | PostgreSQL via [Neon](https://neon.tech) (serverless) |
| ORM | Prisma 6 |
| Auth | NextAuth.js 4 · bcryptjs · JWT sessions |
| Image uploads | Local disk (dev) · S3-compatible storage (prod) |
| Deployment | Vercel |

---

## Project Structure

```
aurum-realty/
├── app/
│   ├── (auth)/                 # Login page — standalone layout
│   │   └── login/
│   ├── (public)/               # Public website — nav + footer layout
│   │   ├── page.tsx            # Home
│   │   ├── properties/         # Listings + detail
│   │   ├── blog/               # Blog list + post
│   │   ├── news/               # News list + article
│   │   ├── about/
│   │   ├── services/
│   │   └── contact/
│   ├── dashboard/              # Private admin — sidebar + topbar layout
│   │   ├── page.tsx            # Overview / stats
│   │   ├── properties/         # CRUD for property listings
│   │   ├── blog/               # CRUD for blog posts
│   │   ├── news/               # CRUD for news articles
│   │   ├── showings/           # Showing requests inbox
│   │   ├── contact-messages/   # Contact form inbox
│   │   ├── users/              # User + role management
│   │   ├── settings/           # Site settings (contact, hours, social)
│   │   ├── home/               # Home page content editor
│   │   ├── about/              # About page content editor
│   │   └── services/           # Services page content editor
│   └── api/                    # API routes
│       ├── auth/[...nextauth]/
│       ├── properties/
│       ├── blog/
│       ├── news/
│       ├── contact/
│       ├── showings/
│       ├── roles/
│       ├── users/
│       ├── site-content/
│       └── upload/
├── components/
│   ├── AurumLogo.tsx
│   ├── Navigation.tsx
│   ├── Footer.tsx
│   ├── ImageUpload.tsx
│   ├── AuthSessionProvider.tsx
│   └── dashboard/
│       ├── DashboardSidebar.tsx
│       ├── DashboardTopBar.tsx
│       └── DashboardShared.tsx
├── lib/
│   ├── prisma.ts               # Prisma singleton
│   ├── auth.ts                 # NextAuth config + RBAC session
│   ├── rbac.ts                 # Permission definitions (client-safe)
│   ├── rbac-server.ts          # Bootstrap + DB permission loading
│   ├── api-auth.ts             # requireApiPermissions() helper
│   └── upload-storage.ts       # Local / S3 upload adapter
├── prisma/
│   ├── schema.prisma
│   └── seed.sql
├── types/
│   └── next-auth.d.ts
└── middleware.ts               # Route-level auth + RBAC guard
```

---

## Database Schema

Ten models across three domains:

**Content** — `Property` · `BlogPost` · `NewsArticle` · `SiteContent`

**Submissions** — `Showing` · `ContactMessage`

**Access control** — `User` · `Role` · `Permission` · `RolePermission`

---

## Role-Based Access Control

The system uses dynamic, database-backed RBAC. Roles are named bundles of permission keys stored in the database — not hardcoded strings.

**How it works:**
1. At login, the user's assigned role and its permissions are loaded from the database
2. Permission keys are embedded into the JWT token
3. Every dashboard route checks permissions before rendering
4. Every mutating API route checks permissions before executing
5. The sidebar and UI adapt to show only what the user can access

**Built-in roles:**

| Role | Access |
|---|---|
| Super Admin | Full access to everything |
| Property Manager | Properties + showing submissions |
| Editor | Blog + news creation and editing |
| Support | View and update submissions only |

Super Admin can create custom roles with any combination of the 25 available permissions through the dashboard — no code changes required.

**Permission groups:** General · Properties · Blog · News · Pages · Submissions · Users · Roles · Settings

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier is sufficient)
- npm

### 1. Clone and install

```bash
git clone https://github.com/your-username/aurum-realty.git
cd aurum-realty
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env
```

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."        # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Image uploads — leave blank for local disk in development
S3_REGION=""
S3_BUCKET=""
S3_PUBLIC_URL=""
S3_ACCESS_KEY_ID=""
S3_SECRET_ACCESS_KEY=""
```

### 3. Set up the database

Apply the schema to your Neon database:

```bash
npx prisma migrate deploy
```

Seed with sample data (18 properties, 6 blog posts, 6 news articles, 4 users):

```bash
psql $DATABASE_URL -f prisma/seed.sql
```

Or paste `prisma/seed.sql` directly into the Neon SQL editor.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The admin dashboard is at [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

**Default admin credentials** (from seed data):
```
Email:    admin@aurumrealty.com
Password: Password123!
```

> Change this password immediately after first login.

---

## Image Uploads

Uploads are handled by `lib/upload-storage.ts`, which automatically selects the right driver:

| Environment | Driver | Where files go |
|---|---|---|
| Development | Local disk | `public/uploads/` |
| Production (S3 vars set) | S3-compatible | Your object storage bucket |

**Supported S3-compatible providers** — no code changes needed, just set the environment variables:

- AWS S3
- Cloudflare R2 (also set `S3_ENDPOINT` and `S3_FORCE_PATH_STYLE=true`)
- DigitalOcean Spaces
- Backblaze B2

Accepted formats: JPEG · PNG · WebP · GIF · Max 10 MB (configurable via `UPLOAD_MAX_SIZE_MB`)

---

## Deployment

### Vercel (recommended)

**1. Push to GitHub**

```bash
git add .
git commit -m "initial commit"
git push origin main
```

Make sure `.env` is not committed. It should be in `.gitignore` already.

**2. Import into Vercel**

Go to [vercel.com](https://vercel.com) → Add New Project → import your repository. Vercel auto-detects Next.js.

**3. Set environment variables**

In Vercel → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `NEXTAUTH_SECRET` | New secret: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `S3_REGION` | e.g. `us-east-1` |
| `S3_BUCKET` | Your bucket name |
| `S3_PUBLIC_URL` | e.g. `https://your-bucket.s3.amazonaws.com` |
| `S3_ACCESS_KEY_ID` | IAM access key |
| `S3_SECRET_ACCESS_KEY` | IAM secret key |

**4. Deploy**

Click Deploy. After the first deploy, update `NEXTAUTH_URL` to your actual Vercel URL and redeploy.

**5. Run migrations on production**

```bash
DATABASE_URL="your-neon-connection-string" npx prisma migrate deploy
```

Or run this directly in the Neon SQL editor:

```sql
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "permissionsVersion" INTEGER NOT NULL DEFAULT 0;
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | Random string for JWT signing |
| `NEXTAUTH_URL` | ✅ | Full URL of the app (no trailing slash) |
| `S3_REGION` | Prod | AWS region or provider region |
| `S3_BUCKET` | Prod | Storage bucket name |
| `S3_PUBLIC_URL` | Prod | Public base URL for uploaded files |
| `S3_ACCESS_KEY_ID` | Prod | Storage access key |
| `S3_SECRET_ACCESS_KEY` | Prod | Storage secret key |
| `S3_ENDPOINT` | R2/custom | Custom endpoint for non-AWS providers |
| `S3_FORCE_PATH_STYLE` | R2 | Set `true` for Cloudflare R2 |
| `S3_PREFIX` | Optional | Folder prefix, e.g. `uploads` |
| `UPLOAD_STORAGE` | Optional | Force `local` or `s3` regardless of environment |
| `UPLOAD_MAX_SIZE_MB` | Optional | Max upload size in MB (default: 10) |

---

## Available Scripts

```bash
npm run dev      # Start development server (Webpack mode)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## Dashboard Overview

The dashboard at `/dashboard` is a protected area accessible only to authenticated users with appropriate permissions.

**Content management**
- Add, edit, and publish property listings with images, features, and pricing
- Write and publish blog posts and news articles with hero images
- Edit the public Home, About, and Services page content

**Submissions**
- View and manage showing requests from the property detail pages
- View and manage contact form submissions
- Update statuses (New → Confirmed → Completed)

**User management** *(Super Admin only)*
- Invite team members and assign roles
- Create custom roles with granular permissions
- Deactivate users

**Site settings** *(Super Admin only)*
- Update company contact details, office hours, and social links
- Changes reflect immediately on the public website footer and contact page

--

## Design System

| Token | Value | Usage |
|---|---|---|
| `--color-gold` | `#D4AF37` | Primary accent, CTAs, prices |
| `--color-charcoal` | `#1F1F1F` | Primary text, dark backgrounds |
| `--color-cream` | `#F5E6D3` | Section backgrounds, sidebar |
| `--color-taupe` | `#7A7571` | Secondary text, inactive states |
| `--color-light-gray` | `#E8E6E1` | Borders, dividers |

Typography: Georgia serif for headings · System sans-serif for body text

