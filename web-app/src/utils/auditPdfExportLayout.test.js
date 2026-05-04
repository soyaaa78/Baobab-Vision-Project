import test from "node:test";
import assert from "node:assert/strict";
import {
  AUDIT_PDF_CELL_TEXT_STYLE,
  AUDIT_PDF_COLUMN_WIDTHS,
  AUDIT_PDF_EXPORT_FONT_SIZE_PX,
} from "./auditPdfExportLayout.js";

test("audit PDF export uses a larger base font for readability", () => {
  assert.equal(AUDIT_PDF_EXPORT_FONT_SIZE_PX, 20);
});

test("audit PDF export columns are tuned to avoid text spilling between columns", () => {
  assert.equal(AUDIT_PDF_COLUMN_WIDTHS.dateTime, 180);
  assert.equal(AUDIT_PDF_COLUMN_WIDTHS.staff, 160);
  assert.equal(AUDIT_PDF_COLUMN_WIDTHS.role, 130);
  assert.equal(AUDIT_PDF_COLUMN_WIDTHS.type, 130);
  assert.equal(AUDIT_PDF_COLUMN_WIDTHS.action, 130);
  assert.equal(AUDIT_PDF_COLUMN_WIDTHS.target, 230);
  assert.equal(AUDIT_PDF_COLUMN_WIDTHS.ip, 140);
  assert.equal(AUDIT_PDF_COLUMN_WIDTHS.device, 430);
  assert.equal(AUDIT_PDF_COLUMN_WIDTHS.metadata, 330);
  assert.equal(AUDIT_PDF_COLUMN_WIDTHS.changes, 330);
});

test("audit PDF export cell text style enforces wrapping", () => {
  assert.equal(AUDIT_PDF_CELL_TEXT_STYLE.wordBreak, "break-word");
  assert.equal(AUDIT_PDF_CELL_TEXT_STYLE.overflowWrap, "anywhere");
});
