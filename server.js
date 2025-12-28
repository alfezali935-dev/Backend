const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Path to the products JSON file
const productsFilePath = path.join(__dirname, 'products.json');

// API Route for the root URL to show a welcome message
app.get('/', (req, res) => {
  res.send('<h1>Welcome to the ShopCart API!</h1><p>Visit <a href="/api/products">/api/products</a> to see the product data.</p>');
});

// API Route to get products
app.get('/api/products', (req, res) => {
  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error("Error reading products.json:", err);
      return res.status(500).json({ message: "Error reading products data." });
    }
    try {
      const products = JSON.parse(data);
      res.json(products);
    } catch (parseErr) {
      console.error("Error parsing products.json:", parseErr);
      return res.status(500).json({ message: "Error parsing products data." });
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));