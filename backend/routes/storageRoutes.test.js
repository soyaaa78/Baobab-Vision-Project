const test = require("node:test");
const assert = require("node:assert/strict");

const storageRoutes = require("./storageRoutes");

const getRouteMiddlewareNames = (path, method) => {
  const layer = storageRoutes.stack.find(
    (entry) => entry.route?.path === path && entry.route?.methods?.[method]
  );
  assert.ok(layer, `Expected route ${method.toUpperCase()} ${path} to exist`);
  return layer.route.stack.map((entry) => entry.handle.name);
};

test("admin storage routes require admin token before upload/delete handlers", () => {
  assert.equal(getRouteMiddlewareNames("/upload", "post")[0], "verifyToken");
  assert.equal(getRouteMiddlewareNames("/upload/models", "post")[0], "verifyToken");
  assert.equal(getRouteMiddlewareNames("/delete", "delete")[0], "verifyToken");
});

test("storage asset proxy route is public", () => {
  assert.deepEqual(getRouteMiddlewareNames("/assets/*", "get"), [""]);
});

test("user storage upload routes require user token before multer handlers", () => {
  assert.equal(
    getRouteMiddlewareNames("/upload/proof-of-payment", "post")[0],
    "authenticateUser"
  );
  assert.equal(
    getRouteMiddlewareNames("/upload/rating-pictures", "post")[0],
    "authenticateUser"
  );
});
