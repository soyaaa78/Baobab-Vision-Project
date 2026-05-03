# Cloudflare R2 Setup and Migration Guide

This project is now R2-only for storage operations. New uploads and real deletes use Cloudflare R2.
Legacy Firebase URLs are accepted by the delete endpoint as a successful no-op to avoid breaking old clients.

## 1. Cloudflare account setup

1. Sign in to Cloudflare dashboard.
2. Open `Storage & databases` -> `R2`.
3. Complete the R2 subscription/activation flow.
4. Create an R2 bucket for this app.
5. Create an API token/key with object read/write permissions scoped to this bucket.
6. Configure a public URL base for object delivery:
- Preferred: custom domain bound to the bucket (for stable URLs).
- Alternative: R2 public dev URL.
7. Confirm object delivery prerequisites before app rollout:
- Bucket/domain path used by `R2_PUBLIC_BASE_URL` is publicly readable for required assets.
- Custom domain binding (if used) is active and serving from the target bucket.
- Caching settings are reviewed for expected update behavior.
- Optional: set CORS policy if direct browser uploads/downloads are needed.

## 2. Backend environment variables

Add these values to `backend/.env`:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`

See `docs/cloudflare-r2-environment-keys.md` for where to get each Cloudflare value.

Optional:

- `R2_ENDPOINT` (defaults to `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`)
- `R2_REGION` (defaults to `auto`)

`R2_PUBLIC_BASE_URL` must be a public bucket URL such as `https://pub-<hash>.r2.dev` or a custom domain. Do not use `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com` for public URLs; that is the private S3 API endpoint and browser image loads will fail.

## 3. Runtime behavior

- All new uploads go to R2.
- Delete endpoint behavior:
- R2 URL: real delete in R2 bucket
- Firebase URL: successful no-op (no Firebase SDK call)
- Unknown URL: rejected as unsupported format

## 4. Pre-cutover checks

Pre-cutover artifacts (must be captured before any production change):
1. Current production backend release identifier.
2. Current production secret snapshot location (secure store path/version).
3. One-command rollback instruction tested in staging.
4. Incident channel and approver-on-duty for the cutover window.

1. Configure R2 env vars in staging.
2. Run smoke checks for upload + delete on each flow:
- Product images
- Product 3D models
- Proof of payment uploads
- Rating picture uploads
- User profile image upload
- Slideshow image upload
3. Verify delete of one known legacy Firebase URL returns success (no-op).
4. Run failure-path checks:
- Delete endpoint with unsupported URL format returns controlled error.
- Upload failure surfaces actionable error in backend logs.
- Invalid/missing credentials are detected before production cutover.
5. Validate public asset access from browser using `R2_PUBLIC_BASE_URL`.

## 5. Production cutover

1. Assign roles for the window:
- Operator: executes env/config and deploy steps.
- Observer: monitors logs/alerts.
- Approver: gives go/no-go for rollback.
2. Apply the same validated env values to production secrets.
3. Deploy backend.
4. Execute production smoke checks (same list as staging) immediately after deploy.
5. Monitor for at least 30 minutes:
- Upload endpoint 5xx rate < 1% over a 30-minute window.
- Delete endpoint 5xx rate < 1% over a 30-minute window.
- Upload/delete endpoint p95 latency < 2s.
- No sustained API error spike (>2x pre-cutover baseline for 10+ minutes).

## 6. Rollback plan

Trigger rollback if any of the following occur after cutover:
- Sustained upload failures due to R2 auth/config.
- Asset delivery failures from `R2_PUBLIC_BASE_URL`.
- Elevated delete failures affecting user workflows.

Rollback steps:
1. Revert backend deployment to prior stable release.
2. Restore previous secret/env configuration.
3. Re-run smoke checks on critical upload flows.
4. Announce rollback completion and open incident follow-up.

## 7. Legacy Firebase retirement criteria

R2-only migration validation queries (run against production snapshot first, then production):

You can run the automated check from backend:

```bash
cd backend
npm run check:legacy-firebase-urls
```

The script exits `0` when all counts are zero, and exits `2` when legacy URLs still exist.

```javascript
// Product image/media fields
db.products.countDocuments({
  $or: [
    { imageUrls: { $elemMatch: { $regex: "firebasestorage.googleapis.com", $options: "i" } } },
    { colorwayImageUrls: { $elemMatch: { $regex: "firebasestorage.googleapis.com", $options: "i" } } },
    { model3dUrl: { $regex: "firebasestorage.googleapis.com", $options: "i" } },
    { "colorOptions.imageUrl": { $regex: "firebasestorage.googleapis.com", $options: "i" } },
    { "colorOptions.model3dUrl": { $regex: "firebasestorage.googleapis.com", $options: "i" } }
  ]
});

// User profile images
db.users.countDocuments({
  profileImage: { $regex: "firebasestorage.googleapis.com", $options: "i" }
});

// Slideshow images
db.slideshowimages.countDocuments({
  imagePath: { $regex: "firebasestorage.googleapis.com", $options: "i" }
});

// Proof of payment images
db.proofofpayments.countDocuments({
  proofOfPaymentImage: { $regex: "firebasestorage.googleapis.com", $options: "i" }
});

// Rating pictures
db.ratings.countDocuments({
  pictures: { $elemMatch: { $regex: "firebasestorage.googleapis.com", $options: "i" } }
});
```

Retirement gate decision rule:
- Proceed only if every query above returns `0`.
- If any query returns non-zero, schedule backfill cleanup for remaining legacy records.

After criteria are met:
1. Keep runtime/storage configuration R2-only.
2. Keep delete endpoint soft no-op behavior for historical Firebase links.
3. Update runbooks and onboarding docs to R2-only behavior.

## 8. Billing note

R2 has monthly free usage limits, but no separate upfront setup fee is required by this codebase.
You still need Cloudflare billing enabled for usage beyond free limits.
