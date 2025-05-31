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
    paymentMethod: String,
    status: {
      type: String,
      enum: ["pending", "paid", "preparing", "ready to pick up"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
