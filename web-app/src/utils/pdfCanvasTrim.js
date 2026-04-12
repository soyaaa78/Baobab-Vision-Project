export function computeEffectiveCanvasHeight(
  canvas,
  {
    whiteThreshold = 250,
    alphaThreshold = 10,
    sampleStep = 4,
    paddingPx = 2,
  } = {}
) {
  if (!canvas?.width || !canvas?.height) {
    return 0;
  }

  const context =
    canvas.getContext?.("2d", { willReadFrequently: true }) ||
    canvas.getContext?.("2d");

  if (!context?.getImageData) {
    return canvas.height;
  }

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;

  for (let y = height - 1; y >= 0; y -= 1) {
    const rowStart = y * width * 4;

    for (let x = 0; x < width; x += sampleStep) {
      const idx = rowStart + x * 4;
      const alpha = data[idx + 3];

      if (alpha <= alphaThreshold) {
        continue;
      }

      const red = data[idx];
      const green = data[idx + 1];
      const blue = data[idx + 2];

      const hasInk =
        red < whiteThreshold || green < whiteThreshold || blue < whiteThreshold;

      if (hasInk) {
        return Math.min(height, y + 1 + paddingPx);
      }
    }
  }

  return 1;
}
