import test from "node:test";
import assert from "node:assert/strict";
import { getPdfExportButtonLabel } from "./pdfExportUi.js";

test("getPdfExportButtonLabel returns default label when not exporting", () => {
  assert.equal(getPdfExportButtonLabel(false), "Export PDF");
});

test("getPdfExportButtonLabel returns loading label while exporting", () => {
  assert.equal(getPdfExportButtonLabel(true), "Exporting PDF...");
});
