const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');

// GET /api/sales - get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find();
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sales - add new sale
router.post('/', async (req, res) => {
  try {
    const { itemName, quantity, price, total, date } = req.body;
    const newSale = new Sale({ itemName, quantity, price, total, date });
    await newSale.save();
    res.status(201).json(newSale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 