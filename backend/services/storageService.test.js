const test = require("node:test");
const assert = require("node:assert/strict");

const storageService = require("./storageService");

test("deleteByUrl returns no-op for legacy Firebase URL", async () => {
  const result = await storageService.deleteByUrl(
    "https://firebasestorage.googleapis.com/v0/b/demo-bucket/o/products%2Fimages%2Fabc.jpg?alt=media&token=1"
  );

  assert.deepEqual(result, { noop: true, provider: "legacy_noop" });
});
