require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const slideshowRoutes = require('./routes/slideShowRoutes');
const cartRoutes = require('./routes/cartRoutes');
const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/authRoutes', authRoutes); 
app.use('/api/productRoutes', productRoutes);
app.use('/api/slideshowRoutes', slideshowRoutes);
app.use('/api/cartRoutes', cartRoutes);
app.use('/uploads', express.static('uploads'));
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
