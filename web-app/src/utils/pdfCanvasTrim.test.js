import test from "node:test";
import assert from "node:assert/strict";
import { computeEffectiveCanvasHeight } from "./pdfCanvasTrim.js";

function createMockCanvas(width, height, nonWhiteRows = []) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }

  for (const row of nonWhiteRows) {
    for (let x = 0; x < width; x += 1) {
      const idx = (row * width + x) * 4;
      data[idx] = 0;
      data[idx + 1] = 0;
      data[idx + 2] = 0;
      data[idx + 3] = 255;
    }
  }

  return {
    width,
    height,
    getContext: () => ({
      getImageData: () => ({ data }),
    }),
  };
}

test("computeEffectiveCanvasHeight trims bottom white rows", () => {
  const canvas = createMockCanvas(8, 10, [6]);
  const height = computeEffectiveCanvasHeight(canvas, { paddingPx: 0 });
  assert.equal(height, 7);
});

test("computeEffectiveCanvasHeight keeps at least one row for all-white canvas", () => {
  const canvas = createMockCanvas(8, 10, []);
  const height = computeEffectiveCanvasHeight(canvas, { paddingPx: 0 });
  assert.equal(height, 1);
});

test("computeEffectiveCanvasHeight falls back to full height without context", () => {
  const canvas = { width: 8, height: 10, getContext: () => null };
  const height = computeEffectiveCanvasHeight(canvas, { paddingPx: 0 });
  assert.equal(height, 10);
});
