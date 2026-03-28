require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises; // Use Promise-based FS for async/await
const path = require('path');
const mongoose = require('mongoose');
const twilio = require('twilio');

const app = express();

// Twilio Configuration from userController.js
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

// Middleware
app.use(cors());
app.use(express.json());

// Path to the products JSON file
const productsFilePath = path.join(__dirname, 'products.json');

// Connect to MongoDB (local or Atlas)
mongoose.connect("mongodb+srv://user_1:QDmQIS6JvgehXyVw@cluster0.ybnot14.mongodb.net/?appName=Cluster0")
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

// Create Schema
const cartItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  mobile: String
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

// API Route for the root URL to show a welcome message
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the ShopCart API!</h1><p>Visit <a href="/api/products">/api/products</a> to see the product data.</p>');
});

// API Route to get products
app.get('/api/products', async (req, res) => {
  try {
    // Asynchronous file read
    const data = await fs.readFile(productsFilePath, 'utf8');
    const products = JSON.parse(data);
    res.json(products);
  } catch (err) {
    console.error("Error reading/parsing products.json:", err);
    return res.status(500).json({ message: "Error retrieving products data." });
  }
});

// API Route to save cart
app.post('/api/cart', async (req, res) => {
  const { mobile, items } = req.body;

  if (!mobile || !items || !Array.isArray(items)) {
    return res.status(400).send("Invalid data");
  }

  try {
    const savedItems = items.map(item => ({
      ...item,
      mobile // add mobile number with each item
    }));

    // Save to MongoDB
    await CartItem.insertMany(savedItems);

    // WhatsApp Logic: Format and send message
    const orderSummary = items.map(i => `${i.name} (Qty: ${i.quantity}) - ₹${i.price}`).join('\n');
    const messageBody = `*New Order Received!*\n\n*Mobile:* ${mobile}\n*Items:*\n${orderSummary}`;

    await client.messages.create({
      body: messageBody,
      from: 'whatsapp:+14155238886', // Twilio Sandbox Number
      to: `whatsapp:+917300425204`    // Prepending +91 for Indian numbers
    });

    res.status(200).send('Cart saved successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving cart');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
