const mongoose = require("mongoose");

const ProofOfPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    proofOfPaymentImage: { type: String, required: true },
    referenceNumber: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProofOfPayment", ProofOfPaymentSchema);
