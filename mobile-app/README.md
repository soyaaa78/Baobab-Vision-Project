# Baobab Mobile Application

## Environment Variables

This Flutter app reads compile-time environment variables via `--dart-define`.

### Available variables

- `API_BASE_URL` (default: `https://baobab-vision-project.onrender.com`)
- `VTO_WEB_BASE_URL` (default: `https://baobab-vto.vercel.app`)

### Example values

```env
API_BASE_URL=https://baobab-vision-project.onrender.com
VTO_WEB_BASE_URL=https://baobab-vto.vercel.app
```

### Run with env values

```bash
flutter run \
  --dart-define=API_BASE_URL=https://baobab-vision-project.onrender.com \
  --dart-define=VTO_WEB_BASE_URL=https://baobab-vto.vercel.app
```

