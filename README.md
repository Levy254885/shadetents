# Shade Tents East Africa — Vite + TypeScript + CSS + HTML
Public site: `/` (clean URLs: /products/church-tents, /product/…, /blog/…). Admin: `/admin`.
## Setup
1. `npm install`, copy `.env.example` to `.env`, fill the Firebase web config (VITE_*).
2. Firebase: enable Email/Password auth + Firestore, deploy `firestore.rules`.
3. Create your admin in Authentication, then add Firestore doc `users/<UID>` = `{ role: "admin" }`.
4. Cloudinary + admin signing: set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `FIREBASE_SERVICE_ACCOUNT` (JSON) in Vercel env. Secrets stay server-side in `api/sign.ts`.
5. `npm run dev` / `npm run build`; deploy to Vercel (vercel.json handles clean URLs). Replace YOUR-DOMAIN in `public/sitemap.xml` and `robots.txt`.
`npm run typecheck` runs tsc (types are light: strict mode is off).
