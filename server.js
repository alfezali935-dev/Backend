const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Step 1: Connect to MongoDB (local or Atlas)
mongoose.connect('mongodb+srv://user_1:QDmQIS6JvgehXyVw@cluster0.ybnot14.mongodb.net/?appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Step 2: Create Schema
const cartItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  mobile: String
});

const CartItem = mongoose.model('CartItem', cartItemSchema);

// Step 3: Create API Route
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

    await CartItem.insertMany(savedItems);
    res.status(200).send('Cart saved successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving cart');
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});