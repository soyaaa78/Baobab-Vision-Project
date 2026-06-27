// Authoritative taxonomy for audit-log action categories.
// Maps each event type to an ordered list of canonical `actionCategory` tokens
// (matching the backend's `actionCategory` field on each audit log).

export const ACTION_CATEGORIES_BY_EVENT_TYPE = {
  auth: ["login", "logout", "password_reset", "otp", "email_verification"],
  staff: ["create", "update_permissions", "enable", "disable", "delete"],
  user: ["enable", "disable", "delete"],
  product: ["create", "update", "update_recommendation", "delete"],
  order: [
    "update_status",
    "payment_approve",
    "payment_decline",
    "cancellation_approve",
    "cancellation_decline",
    "delete",
  ],
  rating: ["respond", "edit_response", "clear_response"],
  admin: ["change_password"],
  payment: [], // none logged today
};

// Human-friendly labels for category tokens.
export const ACTION_CATEGORY_LABELS = {
  login: "Logged In",
  logout: "Logged Out",
  password_reset: "Password Reset",
  otp: "OTP",
  email_verification: "Email Verification",
  create: "Created",
  update: "Updated",
  update_permissions: "Permissions Updated",
  update_recommendation: "Recommendation Updated",
  update_status: "Status Changed",
  enable: "Enabled",
  disable: "Disabled",
  delete: "Deleted",
  payment_approve: "Payment Approved",
  payment_decline: "Payment Declined",
  cancellation_approve: "Cancellation Approved",
  cancellation_decline: "Cancellation Declined",
  respond: "Responded",
  edit_response: "Response Edited",
  clear_response: "Response Cleared",
  change_password: "Password Changed",
};

const titleCase = (token) =>
  String(token)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Returns the ordered category tokens for a given event type.
// For "all" (or unknown), returns the de-duplicated union of every type's
// tokens, preserving the stable order in which they first appear.
export function getActionCategoriesForEventType(eventType) {
  if (eventType && eventType !== "all") {
    return ACTION_CATEGORIES_BY_EVENT_TYPE[eventType] || [];
  }

  const union = [];
  const seen = new Set();
  for (const tokens of Object.values(ACTION_CATEGORIES_BY_EVENT_TYPE)) {
    for (const token of tokens) {
      if (!seen.has(token)) {
        seen.add(token);
        union.push(token);
      }
    }
  }
  return union;
}

// Returns the friendly label for a category token, falling back to a
// title-cased version of the token itself.
export function getActionCategoryLabel(token) {
  if (!token) return "";
  return ACTION_CATEGORY_LABELS[token] || titleCase(token);
}
