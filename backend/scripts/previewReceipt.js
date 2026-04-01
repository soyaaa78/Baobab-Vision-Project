const fs = require("fs");
const path = require("path");
const generateReceiptEmail = require("../services/receiptEmailTemplate");

const html = generateReceiptEmail({
  orderId: "BV-20250329-4F2A1C",
  orderDate: new Date(),
  customerFirstname: "Juan",
  customerLastname: "dela Cruz",
  paymentMethod: "Pay Cash on Pickup", // change to "Gcash" to preview that badge
  deliveryMethod: "Pick Up",
  totalAmount: 4750,
  products: [
    {
      name: "Baobab Classic Round",
      quantity: 1,
      unitPrice: 2500,
      colorName: "Matte Black",
      lensLabel: "Built-in UV400 Lenses (FREE)",
      imageUrl: null, // replace with a real URL if you have one
    },
    {
      name: "Baobab Aviator Pro",
      quantity: 2,
      unitPrice: 1125,
      colorName: "Tortoise Brown",
      lensLabel: "Tinted Brown Lenses",
      imageUrl: null,
    },
  ],
});

const outPath = path.join(__dirname, "receipt_preview.html");
fs.writeFileSync(outPath, html, "utf8");
console.log(`Preview written to: ${outPath}`);
