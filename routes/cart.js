const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");
const { verify } = require("../auth");

// Remove item from cart 
router.patch("/:productId/remove-from-cart", verify, cartController.removeCartItem);

// Clear entire cart 
router.put("/clear-cart", verify, cartController.clearCart);


router.get("/get-cart", verify, cartController.getUserCart);
router.post("/add-to-cart", verify, cartController.addToCart);
router.patch("/update-cart-quantity", verify, cartController.updateCartQuantity);
module.exports = router;
