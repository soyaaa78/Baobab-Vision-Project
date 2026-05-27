# Cloudflare R2 Environment Keys

Use this guide to collect the backend environment variables required for R2 uploads and deletes.

## Required values

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`

Optional values:

- `R2_ENDPOINT`
- `R2_REGION=auto`

## 1. Create or confirm the R2 bucket

1. Sign in to the Cloudflare dashboard.
2. Open `Storage & databases` -> `R2`.
3. Create a bucket for this app, or open the existing bucket.
4. Use the bucket name as `R2_BUCKET_NAME`.

Recommended bucket naming:

```env
R2_BUCKET_NAME=baobab-vision-assets
```

## 2. Get the account ID

1. In the Cloudflare dashboard, open the account that owns the bucket.
2. Find `Account ID` in the account overview or R2 API section.
3. Use that value as `R2_ACCOUNT_ID`.

The default S3-compatible endpoint is derived from it:

```env
R2_ENDPOINT=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
```

You can omit `R2_ENDPOINT` unless you need an explicit override.

## 3. Create R2 API credentials

1. In Cloudflare, open `R2` -> `Manage R2 API Tokens`.
2. Create an API token.
3. Scope the token to the target bucket.
4. Grant object read/write permissions. Delete support also needs object write/delete capability.
5. Copy the generated access key ID and secret access key immediately.

Set:

```env
R2_ACCESS_KEY_ID=<generated-access-key-id>
R2_SECRET_ACCESS_KEY=<generated-secret-access-key>
```

Do not commit these values. Store them only in your deployment secret manager or local `.env`.

## 4. Configure public asset delivery

Choose one public URL strategy:

1. Custom domain bound to the R2 bucket.
2. R2 public development URL.

Preferred production setup is a custom domain, for example:

```env
R2_PUBLIC_BASE_URL=https://cdn.baobabvision.com
```

If using the R2 public development URL, use the exact URL Cloudflare shows for the bucket.

Do not use this as `R2_PUBLIC_BASE_URL`:

```env
R2_PUBLIC_BASE_URL=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
```

That hostname is the private S3-compatible API endpoint. Uploads can succeed through it, but saved image URLs return HTTP 400/403 in browsers and product images will not render.

Use one of these instead:

- R2 public development URL, usually `https://pub-<hash>.r2.dev`
- Custom public domain bound to the bucket, for example `https://cdn.baobabvision.com`

After setting `R2_PUBLIC_BASE_URL`, upload a test file and open its returned URL in a browser. The object must load without backend authentication.

You can also verify a saved image URL with:

```powershell
Invoke-WebRequest -Method Head "https://pub-<hash>.r2.dev/products/images/example.jpg"
```

Expected result:

- Status is `200`
- `Content-Type` starts with `image/`

## 5. Backend `.env` example

```env
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=baobab-vision-assets
R2_PUBLIC_BASE_URL=https://cdn.baobabvision.com
R2_REGION=auto
```

## 6. Validation commands

Run backend tests:

```bash
cd backend
npm test
```

Check whether any database records still reference Firebase-hosted media:

```bash
cd backend
npm run check:legacy-firebase-urls
```

That script requires `MONGO_URI` to point at the database you want to check.

If uploads were already saved with the private S3 endpoint as their public URL, repair those DB URLs after setting the correct public base URL:

```bash
cd backend
R2_OLD_PUBLIC_BASE_URL=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com npm run repair:r2-public-base-url
```

Review the dry-run output. Then apply:

```bash
cd backend
R2_OLD_PUBLIC_BASE_URL=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com npm run repair:r2-public-base-url -- --apply
```

## 7. Deployment checklist

Before production deploy:

1. R2 bucket exists.
2. API credentials are scoped to the correct bucket.
3. Backend secret manager contains all required `R2_*` values.
4. `R2_PUBLIC_BASE_URL` serves objects publicly.
5. `npm test` passes.
6. Staging upload/delete smoke tests pass.
7. Production rollback release and secret snapshot are recorded.
