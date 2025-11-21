const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");
const { verify } = require("../auth");

// Get user cart
router.get("/get-cart", verify, cartController.getUserCart);

// Add to cart
router.post("/add-to-cart", verify, cartController.addToCart);

// Update item quantity
router.patch("/update-cart-quantity", verify, cartController.updateCartQuantity);

// Remove single item
router.delete("/productId/remove-from-cart", verify, cartController.removeCartItem);

// Clear entire cart
router.delete("/clear-cart", verify, cartController.clearCart);

module.exports = router;
