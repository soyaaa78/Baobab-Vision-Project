# Cloudflare R2 Setup and Migration Guide

This project now uploads new assets to Cloudflare R2 and keeps legacy Firebase delete support for existing Firebase URLs.

## 1. Cloudflare account setup

1. Sign in to Cloudflare dashboard.
2. Open `Storage & databases` -> `R2`.
3. Complete the R2 subscription/activation flow.
4. Create an R2 bucket for this app.
5. Create an API token/key with object read/write permissions scoped to this bucket.
6. Configure a public URL base for object delivery:
- Preferred: custom domain bound to the bucket (for stable URLs).
- Alternative: R2 public dev URL.

## 2. Backend environment variables

Add these values to `backend/.env`:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`

Optional:

- `R2_ENDPOINT` (defaults to `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`)
- `R2_REGION` (defaults to `auto`)

Legacy compatibility during migration window:

- Keep `FIREBASE_STORAGEBUCKET` to allow deleting previously uploaded Firebase files.

## 3. Runtime behavior

- All new uploads go to R2.
- Delete endpoint supports both:
- R2 URLs (new assets)
- Firebase URLs (legacy assets)

## 4. Rollout sequence

1. Configure R2 env vars in staging.
2. Verify upload + delete for each flow:
- Product images
- Product 3D models
- Proof of payment uploads
- Rating picture uploads
- User profile image upload
- Slideshow image upload
3. Verify delete of one legacy Firebase URL still works.
4. Promote the same env config to production.
5. After old Firebase URLs are fully retired from DB, remove Firebase delete compatibility code and `FIREBASE_STORAGEBUCKET`.

## 5. Billing note

R2 has monthly free usage limits, but no separate upfront setup fee is required by this codebase.
You still need Cloudflare billing enabled for usage beyond free limits.
