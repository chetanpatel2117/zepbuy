// Simple Node.js + Express backend for e-commerce demo
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/zepbuy', { useNewUrlParser: true, useUnifiedTopology: true });

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  address: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String
});
const Product = mongoose.model('Product', productSchema);

// Register
app.post('/register', async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, phone, address, password: hash });
    await user.save();
    res.send('Registration successful!');
  } catch (e) {
    res.status(400).send('Registration failed: ' + (e.code === 11000 ? 'Email already exists.' : e.message));
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('User not found');
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).send('Invalid password');
  res.send('Login successful!');
});

// Get all products
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Add a product (for demo, no auth)
app.post('/products', async (req, res) => {
  const { name, price, image, description } = req.body;
  const product = new Product({ name, price, image, description });
  await product.save();
  res.send('Product added!');
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));
