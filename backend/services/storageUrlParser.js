const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const buildPublicR2Url = (baseUrl, objectKey) => {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  const key = String(objectKey || "").replace(/^\/+/, "");

  if (!normalizedBase) {
    throw new Error("R2 public base URL is not configured");
  }

  if (!key) {
    throw new Error("Object key is required to build public URL");
  }

  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${normalizedBase}/${encodedKey}`;
};

const isLegacyFirebaseUrl = (imageUrl) =>
  typeof imageUrl === "string" && imageUrl.includes("firebasestorage.googleapis.com");

const parseR2KeyFromHttpUrl = (imageUrl, r2PublicBaseUrl) => {
  try {
    const parsed = new URL(imageUrl);
    const pathnameKey = decodeURIComponent(parsed.pathname || "").replace(/^\/+/, "");

    if (!pathnameKey) return null;

    const normalizedBase = normalizeBaseUrl(r2PublicBaseUrl);
    if (normalizedBase && imageUrl.startsWith(`${normalizedBase}/`)) {
      return pathnameKey;
    }

    if (parsed.hostname.endsWith(".r2.cloudflarestorage.com") || parsed.hostname.endsWith(".r2.dev")) {
      return pathnameKey;
    }

    return null;
  } catch (_err) {
    return null;
  }
};

const parseR2Key = (imageUrl, options = {}) => {
  if (typeof imageUrl !== "string") return null;

  if (imageUrl.startsWith("r2://")) {
    const withoutScheme = imageUrl.slice(5);
    const slashIndex = withoutScheme.indexOf("/");
    if (slashIndex === -1) return null;
    const key = decodeURIComponent(withoutScheme.slice(slashIndex + 1)).replace(/^\/+/, "");
    return key || null;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return parseR2KeyFromHttpUrl(imageUrl, options.r2PublicBaseUrl);
  }

  return null;
};

const parseStorageDeletionTarget = (imageUrl, options = {}) => {
  if (isLegacyFirebaseUrl(imageUrl)) {
    return { provider: "legacy_noop" };
  }

  const r2Key = parseR2Key(imageUrl, options);
  if (r2Key) {
    return { provider: "r2", key: r2Key };
  }

  return null;
};

module.exports = {
  buildPublicR2Url,
  parseStorageDeletionTarget,
};
