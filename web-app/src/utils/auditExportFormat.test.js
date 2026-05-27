import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAuditMetadataExportText,
  buildAuditChangeExportText,
  buildAuditTargetExportText,
} from "./auditExportFormat.js";

test("buildAuditMetadataExportText serializes metadata key values", () => {
  const text = buildAuditMetadataExportText({
    metadata: { orderId: 123, status: "processing" },
  });
  assert.equal(text, "orderId: 123; status: processing");
});

test("buildAuditChangeExportText includes only changed fields", () => {
  const text = buildAuditChangeExportText({
    oldValues: { status: "pending", unchanged: "x" },
    newValues: { status: "approved", unchanged: "x" },
  });
  assert.equal(text, "status: pending -> approved");
});

test("buildAuditTargetExportText combines model and id", () => {
  const text = buildAuditTargetExportText({ targetModel: "Order", targetId: "abc123" });
  assert.equal(text, "Order (abc123)");
});
