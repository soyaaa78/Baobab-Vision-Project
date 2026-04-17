const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseStorageDeletionTarget,
  buildPublicR2Url,
} = require("./storageUrlParser");

test("parses Firebase download URL into storage path", () => {
  const target = parseStorageDeletionTarget(
    "https://firebasestorage.googleapis.com/v0/b/demo-bucket/o/products%2Fimages%2Fabc.jpg?alt=media&token=1"
  );

  assert.deepEqual(target, {
    provider: "firebase",
    path: "products/images/abc.jpg",
  });
});

test("parses r2 custom scheme URL", () => {
  const target = parseStorageDeletionTarget("r2://assets-bucket/products/images/file.webp");

  assert.deepEqual(target, {
    provider: "r2",
    key: "products/images/file.webp",
  });
});

test("parses r2 public URL via configured base URL", () => {
  const target = parseStorageDeletionTarget(
    "https://cdn.baobabvision.com/products/images/file.webp",
    { r2PublicBaseUrl: "https://cdn.baobabvision.com" }
  );

  assert.deepEqual(target, {
    provider: "r2",
    key: "products/images/file.webp",
  });
});

test("parses r2 cloudflare endpoint style URL", () => {
  const target = parseStorageDeletionTarget(
    "https://assets-bucket.123abc.r2.cloudflarestorage.com/products/models/a.glb"
  );

  assert.deepEqual(target, {
    provider: "r2",
    key: "products/models/a.glb",
  });
});

test("buildPublicR2Url appends encoded key to base URL", () => {
  const url = buildPublicR2Url(
    "https://cdn.baobabvision.com",
    "products/images/My File #1.jpg"
  );

  assert.equal(
    url,
    "https://cdn.baobabvision.com/products/images/My%20File%20%231.jpg"
  );
});

test("returns null for unsupported URL", () => {
  const target = parseStorageDeletionTarget("https://example.com/whatever.png");
  assert.equal(target, null);
});
