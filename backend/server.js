require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const slideshowRoutes = require('./routes/slideShowRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userProfileRoutes = require('./routes/userProfileRoutes');

// Models
const Admin = require('./models/Admin');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

// Static folders
app.use('/uploads', express.static('uploads'));
app.use('/userprofileuploads', express.static(path.join(__dirname, 'userprofileuploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/slideshow', slideshowRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userProfileRoutes);

// Request logger middleware
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});

// Seed super admin
const seedSuperAdmin = async () => {
  const existing = await Admin.findOne({ role: 'super_admin' });
  if (existing) return;

  const hashedPassword = await bcrypt.hash('superadmin123', 10);

  const superAdmin = new Admin({
    username: 'superadmin',
    email: 'owner@example.com',
    password: hashedPassword,
    role: 'super_admin',
    permissions: ['manage_staff', 'manage_permissions'],
  });

  await superAdmin.save();
  console.log('✅ Super admin seeded');
};

seedSuperAdmin();
