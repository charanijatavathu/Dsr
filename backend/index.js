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

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const itemsRouter = require('./routes/items');
const salesRouter = require('./routes/sales');

app.use('/api/items', itemsRouter);
app.use('/api/sales', salesRouter);

// Placeholder routes
app.get('/api', (req, res) => {
  res.send('Dsr_Kitchens API is running');
});

// TODO: Add /api/items and /api/sales routes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 