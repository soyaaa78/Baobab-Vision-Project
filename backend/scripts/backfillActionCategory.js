#!/usr/bin/env node
/**
 * Backfill the canonical `actionCategory` field on existing AuditLog documents.
 *
 * The field was added after audit logs already existed. This script derives a
 * coarse actionCategory token from each doc's (eventType, action) pair using
 * case-insensitive regex matching, disambiguated by eventType.
 *
 * Properties:
 *  - IDEMPOTENT: only processes docs that lack a valid actionCategory, and
 *    skips any doc that already has one (safe to re-run).
 *  - CONSERVATIVE: only sets a category when confidently matched; unmatched
 *    docs are counted and sampled, never guessed.
 *
 * Run manually:
 *    node scripts/backfillActionCategory.js
 *
 * This is a one-off maintenance script and is NOT wired into app startup.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const AuditLog = require("../models/AuditLog");

const requireEnv = (name) => {
  const value = (process.env[name] || "").trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

// Valid tokens (must mirror the AuditLog schema enum).
const VALID_CATEGORIES = new Set([
  "login",
  "logout",
  "password_reset",
  "otp",
  "email_verification",
  "create",
  "update",
  "update_permissions",
  "update_recommendation",
  "update_status",
  "enable",
  "disable",
  "delete",
  "payment_approve",
  "payment_decline",
  "cancellation_approve",
  "cancellation_decline",
  "respond",
  "edit_response",
  "clear_response",
  "change_password",
]);

/**
 * Derive an actionCategory token from (eventType, action).
 * Returns a token string, or null when no confident match is found.
 * Matching is case-insensitive and disambiguated by eventType.
 */
const deriveActionCategory = (eventType, action) => {
  const type = (eventType || "").toLowerCase();
  const text = action || "";

  switch (type) {
    case "auth": {
      if (/logged in/i.test(text)) return "login";
      if (/logged out/i.test(text)) return "logout";
      if (/email verified/i.test(text)) return "email_verification";
      if (/password reset/i.test(text)) return "password_reset";
      // OTP for login verification / resend (not password reset, handled above)
      if (/otp/i.test(text)) return "otp";
      return null;
    }

    case "staff": {
      if (/created staff/i.test(text)) return "create";
      if (/updated staff permissions/i.test(text)) return "update_permissions";
      if (/disabled staff/i.test(text)) return "disable";
      if (/enabled staff/i.test(text)) return "enable";
      if (/deleted staff/i.test(text)) return "delete";
      return null;
    }

    case "user": {
      if (/disabled user/i.test(text)) return "disable";
      if (/enabled user/i.test(text)) return "enable";
      if (/deleted user/i.test(text)) return "delete";
      return null;
    }

    case "product": {
      if (/created product/i.test(text)) return "create";
      if (/recommendation/i.test(text)) return "update_recommendation";
      if (/updated product/i.test(text)) return "update";
      if (/deleted product/i.test(text)) return "delete";
      return null;
    }

    case "order": {
      // Check disapproved/decline before approved to avoid substring overlap.
      if (/cancellation disapproved/i.test(text)) return "cancellation_decline";
      if (/cancellation approved/i.test(text)) return "cancellation_approve";
      if (/payment disapproved/i.test(text)) return "payment_decline";
      if (/payment approved/i.test(text)) return "payment_approve";
      if (/deleted order/i.test(text)) return "delete";
      if (/status updated/i.test(text)) return "update_status";
      return null;
    }

    case "rating": {
      if (/cleared response/i.test(text)) return "clear_response";
      if (/edited response/i.test(text)) return "edit_response";
      // "Responded to rating" and fallback "Updated response to rating"
      if (/responded to rating|response to rating/i.test(text)) return "respond";
      return null;
    }

    case "admin": {
      if (/changed account password|password/i.test(text)) {
        return "change_password";
      }
      return null;
    }

    default:
      return null;
  }
};

const run = async () => {
  const mongoUri = requireEnv("MONGO_URI");
  await mongoose.connect(mongoUri);

  // Only docs missing a category (absent, null, or empty string).
  const filter = {
    $or: [
      { actionCategory: { $exists: false } },
      { actionCategory: null },
      { actionCategory: "" },
    ],
  };

  const summary = {
    scanned: 0,
    updated: 0,
    skipped: 0, // already had a valid category (shouldn't appear given filter, kept defensively)
    unmatched: 0,
  };
  const unmatchedSamples = [];

  const cursor = AuditLog.find(filter)
    .select("_id eventType action actionCategory")
    .lean()
    .cursor();

  for await (const doc of cursor) {
    summary.scanned += 1;

    // Defensive: skip if it somehow already has a valid category.
    if (doc.actionCategory && VALID_CATEGORIES.has(doc.actionCategory)) {
      summary.skipped += 1;
      continue;
    }

    const category = deriveActionCategory(doc.eventType, doc.action);

    if (!category || !VALID_CATEGORIES.has(category)) {
      summary.unmatched += 1;
      if (unmatchedSamples.length < 10) {
        unmatchedSamples.push({
          _id: doc._id?.toString(),
          eventType: doc.eventType,
          action: doc.action,
        });
      }
      continue;
    }

    await AuditLog.updateOne(
      { _id: doc._id },
      { $set: { actionCategory: category } }
    );
    summary.updated += 1;
  }

  console.log("Backfill actionCategory complete.");
  console.log(
    JSON.stringify(
      {
        scanned: summary.scanned,
        updated: summary.updated,
        skipped: summary.skipped,
        unmatched: summary.unmatched,
        unmatchedSamples,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
  process.exit(0);
};

run().catch(async (error) => {
  console.error(error.message || error);
  try {
    await mongoose.disconnect();
  } catch (_err) {
    // ignore disconnect errors in failure path
  }
  process.exit(1);
});
