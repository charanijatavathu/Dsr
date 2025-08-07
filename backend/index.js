const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in environment variables');
  process.exit(1); // Exit the app if MONGO_URI is missing
}

// ✅ Updated MongoDB connection (no deprecated options)
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
const itemsRouter = require('./routes/items');
const salesRouter = require('./routes/sales');

app.use('/api/items', itemsRouter);
app.use('/api/sales', salesRouter);

// Test route
app.get('/api', (req, res) => {
  res.send('Dsr_Kitchens API is running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
