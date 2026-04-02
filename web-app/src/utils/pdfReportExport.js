import html2canvas from "html2canvas";

const DEFAULT_CAPTURE_OPTIONS = {
  scale: 2,
  useCORS: true,
  allowTaint: false,
  backgroundColor: "#ffffff",
  scrollX: 0,
  scrollY: 0,
};

export async function captureElementCanvas(element, options = {}) {
  const width = Math.max(element.scrollWidth, element.clientWidth);
  const height = Math.max(element.scrollHeight, element.clientHeight);

  return html2canvas(element, {
    ...DEFAULT_CAPTURE_OPTIONS,
    ...options,
    width,
    height,
    windowWidth: width,
    windowHeight: height,
  });
}

function buildSliceCanvas(sourceCanvas, startY, sliceHeight) {
  const sliceCanvas = document.createElement("canvas");
  sliceCanvas.width = sourceCanvas.width;
  sliceCanvas.height = sliceHeight;

  const ctx = sliceCanvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
  ctx.drawImage(
    sourceCanvas,
    0,
    startY,
    sourceCanvas.width,
    sliceHeight,
    0,
    0,
    sourceCanvas.width,
    sliceHeight
  );

  return sliceCanvas;
}

export function addPaginatedCanvasToPdf({
  pdf,
  canvas,
  contentX = 0,
  contentY,
  contentWidth,
  contentHeightPerPage,
  drawPageDecorators,
  imageType = "PNG",
  imageCompression = "FAST",
}) {
  if (!canvas?.width || !canvas?.height) {
    return 0;
  }

  const pxPerUnit = canvas.width / contentWidth;
  const sliceHeightPx = Math.max(1, Math.floor(contentHeightPerPage * pxPerUnit));
  const totalPages = Math.max(1, Math.ceil(canvas.height / sliceHeightPx));

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    const pageNumber = pageIndex + 1;
    drawPageDecorators?.({ pdf, pageNumber, totalPages });

    const sourceOffsetY = pageIndex * sliceHeightPx;
    const currentSliceHeightPx = Math.min(
      sliceHeightPx,
      canvas.height - sourceOffsetY
    );
    const sliceCanvas = buildSliceCanvas(
      canvas,
      sourceOffsetY,
      currentSliceHeightPx
    );
    const sliceHeight = currentSliceHeightPx / pxPerUnit;

    pdf.addImage(
      sliceCanvas.toDataURL("image/png"),
      imageType,
      contentX,
      contentY,
      contentWidth,
      sliceHeight,
      undefined,
      imageCompression
    );
  }

  return totalPages;
}
