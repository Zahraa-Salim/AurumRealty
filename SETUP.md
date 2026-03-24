# Aurum Realty — Phase 2 Setup Guide

## What's in this package

| File | Purpose |
|------|---------|
| `proxy.ts` | Protects all `/dashboard/*` routes — redirects unauthenticated visitors to `/login` |
| `lib/auth.ts` | NextAuth config — credentials provider with bcrypt, JWT session, 8hr expiry |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth catch-all API route |
| `app/(auth)/login/page.tsx` | Login page connected to real `signIn()` — no more setTimeout mock |
| `app/api/upload/route.ts` | Upload endpoint — local disk in development, S3-compatible storage in production |
| `lib/upload-storage.ts` | Upload storage adapter for local files or S3-compatible object storage |
| `components/ImageUpload.tsx` | File upload component — used in property/blog/news forms |
| `app/dashboard/properties/new/page.tsx` | Add property form — save wired to POST `/api/properties` + ImageUpload |
| `app/dashboard/blog/new/page.tsx` | New blog post form — save wired to POST `/api/blog` + ImageUpload |
| `app/dashboard/news/new/page.tsx` | New news article form — save wired to POST `/api/news` + ImageUpload |
| `types/next-auth.d.ts` | TypeScript augmentation — adds `id` and `role` to Session and JWT types |
| `.env.local.example` | Environment variable template |

---

## Step 1 — Install new dependencies

```bash
npm install next-auth bcryptjs
npm install --save-dev @types/bcryptjs

# Remove the two unused packages from the report
npm uninstall @neondatabase/serverless @prisma/adapter-neon
```

---

## Step 2 — Set environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

**`NEXTAUTH_SECRET`** — generate one:
```bash
openssl rand -base64 32
```

**`NEXTAUTH_URL`** — set to your deployment URL in production, `http://localhost:3000` locally.

**Uploads for production** — set `UPLOAD_STORAGE="s3"` and fill the S3 variables. This works with AWS S3 and S3-compatible providers like Cloudflare R2, Backblaze B2 S3, MinIO, and DigitalOcean Spaces.

---

## Step 3 — Drop in the files

Copy all files into your project root, preserving the directory structure. Overwrite existing files when prompted.

The auth gateway file is now `proxy.ts` at the **project root** (same level as `next.config.ts`), not inside `app/`.

---

## Step 4 — Hash existing user passwords

The seed data uses a bcrypt hash of `Password123!` for all four users. If you want to change passwords, generate new hashes:

```bash
node -e "const b=require('bcryptjs'); b.hash('YourNewPassword',10).then(h=>console.log(h))"
```

Then update the password field in your User table via the Neon SQL editor.

---

## Step 5 — Verify authentication works

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000/dashboard` — you should be redirected to `/login`
3. Sign in with `admin@aurumrealty.com` / `Password123!`
4. You should land on `/dashboard`
5. Visit `/login` while logged in — you should be redirected to `/dashboard`

## Step 6 — Run the launch check

Before deploying, run:

```bash
npm run check:launch
```

This checks the most important production env assumptions:

- `NEXTAUTH_URL` is not still pointing at localhost
- uploads are not accidentally left on local disk
- required S3 vars are present when `UPLOAD_STORAGE="s3"`
- Resend notifications are either configured or clearly reported as missing

---

## Using ImageUpload in edit forms

The `ImageUpload` component is ready to drop into the existing edit forms (`/dashboard/properties/edit/[id]`, `/dashboard/blog/edit/[id]`, `/dashboard/news/edit/[id]`). Replace the existing dashed placeholder boxes with:

```tsx
import ImageUpload from '@/components/ImageUpload'

// In your state:
const [heroImage, setHeroImage] = useState(property.heroImage ?? '')

// In your JSX:
<ImageUpload
  value={heroImage}
  onChange={setHeroImage}
  label="Hero image"
  hint="Drop an image here, or click to browse"
/>
```

The component calls `POST /api/upload` internally and returns a stored image URL via `onChange`. In local development that will be `/uploads/...`; in production with `UPLOAD_STORAGE="s3"` it will be your object-storage public URL.

---

## Remaining Phase 2 items

- **Edit forms** (`/edit/[id]` for properties, blog, news) — verify pre-population from DB and wire PATCH on save using the same pattern as the new forms above. Add `ImageUpload` to replace placeholder boxes.
- **Role-based access** — this project now uses dynamic RBAC permissions instead of a single static role check.
- **Email notifications** — optional Resend support is now wired for `/api/contact` and `/api/showings`. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and recipient env vars to activate it.
- **Password change** — the profile page now uses a dedicated `PATCH /api/users/[id]/password` route that verifies the current password with bcrypt and updates the hash.
