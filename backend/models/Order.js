const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        color: {
          type: String,
          required: true,
        },
        lens: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    date: Date,
    address: String,
    contactNumber: String,
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryMethod: {
      type: String,
      enum: ["Pick Up", "Third-Party Delivery"],
      default: "Pick Up",
    },
    paymentMethod: {
      type: String,
      enum: ["Pay Cash on Pickup", "Gcash"],
    },
    thirdPartyDelivery: {
      type: String,
      enum: ["Lalamove", "J&T Express", "GrabExpress", "Ninja Van", "Xend"],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "ready_to_pickup",
        "completed",
        "cancelled",
        "cancelled_pending",
      ],
      default: "pending",
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
    },
    proofOfPayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProofOfPayment",
    },
    rating: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rating",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
