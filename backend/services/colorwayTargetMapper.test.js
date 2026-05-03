const test = require("node:test");
const assert = require("node:assert/strict");

const { applyTargetedUrls, mergeOrderedUrls } = require("./colorwayTargetMapper");

test("applies sparse uploaded colorway image URLs to explicit option targets", () => {
  const colorOptions = [
    { name: "Black", imageUrl: "old-black" },
    { name: "Brown", imageUrl: "old-brown" },
    { name: "Clear", imageUrl: "old-clear" },
  ];

  const result = applyTargetedUrls(
    colorOptions,
    ["new-clear"],
    [2],
    "imageUrl"
  );

  assert.deepEqual(
    result.map((option) => option.imageUrl),
    ["old-black", "old-brown", "new-clear"]
  );
});

test("falls back to dense index mapping when explicit targets are invalid", () => {
  const colorOptions = [
    { name: "Black", model3dUrl: "old-black-model" },
    { name: "Brown", model3dUrl: "old-brown-model" },
  ];

  const result = applyTargetedUrls(
    colorOptions,
    ["new-black-model"],
    [],
    "model3dUrl"
  );

  assert.deepEqual(
    result.map((option) => option.model3dUrl),
    ["new-black-model", "old-brown-model"]
  );
});

test("merges uploaded product image URLs into existing gallery order", () => {
  const result = mergeOrderedUrls(
    ["old-front", "old-side", "preview-only"],
    ["new-back"],
    [2]
  );

  assert.deepEqual(result, ["old-front", "old-side", "new-back"]);
});
