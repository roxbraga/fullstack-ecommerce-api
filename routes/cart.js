const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");
const auth = require("../auth");
const { verify, verifyAdmin } = auth;

// // Public Routes

// Retrieve User cart
router.get('/get-cart', verify, cartController.getUserCart);

// Add to Cart
router.post('/add-to-cart', verify, cartController.addToCart);

// Update Product Quantity
router.patch('/update-cart-quantity', verify, cartController.updateCartQuantity);

module.exports = router;