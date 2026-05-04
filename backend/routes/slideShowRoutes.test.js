const test = require("node:test");
const assert = require("node:assert/strict");

const slideShowRoutes = require("./slideShowRoutes");

const getRouteMiddlewareNames = (path, method) => {
  const layer = slideShowRoutes.stack.find(
    (entry) => entry.route?.path === path && entry.route?.methods?.[method]
  );
  assert.ok(layer, `Expected route ${method.toUpperCase()} ${path} to exist`);
  return layer.route.stack.map((entry) => entry.handle.name);
};

test("slideshow write routes require admin token", () => {
  assert.deepEqual(getRouteMiddlewareNames("/upload-image", "post"), [
    "verifyToken",
    "multerMiddleware",
    "uploadImage",
  ]);
  assert.deepEqual(getRouteMiddlewareNames("/:id", "delete"), [
    "verifyToken",
    "deleteImage",
  ]);
});

test("slideshow read route remains public", () => {
  assert.deepEqual(getRouteMiddlewareNames("/all-images", "get"), ["getAllImages"]);
});
