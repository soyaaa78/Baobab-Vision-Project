const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    // Who performed the action (staff/admin)
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    actorRole: {
      type: String,
      enum: ["super_admin", "staff_product", "staff_order"],
      required: false,
    },

    // Session/Request context
    ip: { type: String, required: false },
    userAgent: { type: String, required: false },

    // What happened
    eventType: {
      type: String,
      enum: ["auth", "product", "user", "staff", "order", "payment", "admin"],
      required: true,
    },
    action: { type: String, required: true }, // e.g., login, verify_otp, create, update, delete, enable, disable, approve, decline, update_status

    // What it acted on
    targetModel: { type: String, required: false }, // e.g., Product, User, Admin, Order, ProofOfPayment
    targetId: { type: mongoose.Schema.Types.Mixed, required: false }, // ObjectId or string like orderId

    // Before/after values
    oldValues: { type: mongoose.Schema.Types.Mixed, required: false },
    newValues: { type: mongoose.Schema.Types.Mixed, required: false },

    // Extra info (reasons, etc.)
    metadata: { type: mongoose.Schema.Types.Mixed, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);
