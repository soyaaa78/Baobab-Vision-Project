const AuditLog = require("../models/AuditLog");

// Safely pick fields to avoid logging sensitive data like passwords
const sanitize = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  const clone = JSON.parse(JSON.stringify(obj));
  const redact = (o) => {
    if (!o || typeof o !== "object") return;
    for (const k of Object.keys(o)) {
      if (["password", "otp", "otpExpiry", "token"].includes(k)) {
        o[k] = "[REDACTED]";
      } else if (o[k] && typeof o[k] === "object") {
        redact(o[k]);
      }
    }
  };
  redact(clone);
  return clone;
};

const getRequestContext = (req) => {
  const ip =
    req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress;
  const userAgent = req.headers["user-agent"];
  // req.user from adminAuthMiddleware; req.userId from authMiddleware
  const actor = req.user?.id || req.userId || null;
  const actorRole = req.user?.role || undefined;
  return { actor, actorRole, ip, userAgent };
};

async function logEvent(
  req,
  {
    eventType,
    action,
    targetModel,
    targetId,
    oldValues,
    newValues,
    metadata,
    forceSystem = false,
  }
) {
  try {
    const ctx = getRequestContext(req);
    let actor = ctx.actor;
    let actorRole = ctx.actorRole;
    // Only use 'system' if forceSystem is true (for scheduled jobs, etc.)
    if (!actor && !forceSystem) {
      console.warn(
        "[AuditLog] No user context found for event. This should be avoided except for true system events."
      );
      // Optionally, you could throw here to enforce user context
      // throw new Error("User context required for audit logging");
    }
    if (!actor && forceSystem) {
      actor = "system";
      actorRole = "system";
    }
    await AuditLog.create({
      actor,
      actorRole,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
      eventType,
      action,
      targetModel,
      targetId,
      oldValues: sanitize(oldValues),
      newValues: sanitize(newValues),
      metadata: sanitize(metadata),
    });
  } catch (e) {
    // Do not break main flow on audit errors
    console.error("[AuditLog] Failed to record event:", e.message);
  }
}

module.exports = { logEvent };
