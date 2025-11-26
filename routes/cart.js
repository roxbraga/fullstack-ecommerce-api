const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");
const { verify } = require("../auth");

// Get user cart
router.get("/get-cart", verify, cartController.getUserCart);

// Add item to cart
router.post("/add-to-cart", verify, cartController.addToCart);

// Update item quantity in cart
router.patch("/update-cart-quantity", verify, cartController.updateCartQuantity);

// Remove single item from cart
router.patch("/:productId/remove-from-cart", verify, cartController.removeCartItem);

// Clear entire cart
router.put("/clear-cart", verify, cartController.clearCart);

module.exports = router;
