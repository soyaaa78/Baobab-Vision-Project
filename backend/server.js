require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const addressRoutes = require("./routes/addressRoutes");
const proofOfPaymentRoutes = require("./routes/proofOfPaymentRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const slideshowRoutes = require("./routes/slideShowRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const storageRoutes = require("./routes/storageRoutes");
const aliveRoute = require("./routes/aliveRoute");
const auditLogRoutes = require("./routes/auditLogRoutes");
const orderCountsRoute = require("./routes/orderCounts");

// Models
const Admin = require("./models/Admin");
// Ensure these models are registered for population
require("./models/Order/Address");
require("./models/Order/ProofOfPayment");
require("./models/Order/Rating");

const PORT = process.env.PORT || 3001;

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"; // fallback for local dev
const app = express();

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // allow cookies/auth headers if needed
  })
);
app.use(express.json());
// trust proxy for correct req.ip behind reverse proxies
app.set("trust proxy", true);

// Static folders
app.use("/uploads", express.static("uploads"));
app.use(
  "/userprofileuploads",
  express.static(path.join(__dirname, "userprofileuploads"))
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/proof-of-payment", proofOfPaymentRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/slideshow", slideshowRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userProfileRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/alive", aliveRoute);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/order-counts", orderCountsRoute);

// Request logger middleware
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// MongoDB connection with proper index control
mongoose
  .connect(process.env.MONGO_URI, {
    autoIndex: process.env.NODE_ENV !== "production", // ✅ disables auto-indexing in production
  })
  .then(async () => {
    console.log("✅ MongoDB connected");
    await dropLegacyFirstnameIndex(); // ✅ clean legacy index if it exists
  })
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

// Seed System Admin
const seedSuperAdmin = async () => {
  const existing = await Admin.findOne({ role: "system_admin" });
  if (existing) return;

  const hashedPassword = await bcrypt.hash("superadmin123", 10);

  const superAdmin = new Admin({
    username: "superadmin",
    email: "owner@example.com",
    password: hashedPassword,
    role: "system_admin",
    permissions: ["manage_staff", "manage_permissions"],
  });

  await superAdmin.save();
  console.log("✅ System Admin seeded");
};

seedSuperAdmin();

// Drop legacy firstname index if exists
const dropLegacyFirstnameIndex = async () => {
  try {
    const indexInfo = await mongoose.connection.db
      .collection("users")
      .indexInformation({ full: true });

    const hasFirstnameIndex = indexInfo.some(
      (index) => index.name === "firstname_1"
    );
    if (hasFirstnameIndex) {
      await mongoose.connection.db.collection("users").dropIndex("firstname_1");
      console.log("🧹 Dropped legacy unique index on firstname");
    } else {
      console.log("ℹ️ No legacy firstname index to drop");
    }
  } catch (err) {
    console.error("⚠️ Error checking/dropping firstname index:", err.message);
  }
};
