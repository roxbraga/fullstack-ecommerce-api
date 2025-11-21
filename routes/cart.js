const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");
const { verify } = require("../auth");

router.get("/get-cart", verify, cartController.getUserCart);
router.post("/add-to-cart", verify, cartController.addToCart);
router.patch("/update-cart-quantity", verify, cartController.updateCartQuantity);
router.delete("/remove-from-cart/:productId", verify, cartController.removeCartItem);
router.delete("/clear-cart", verify, cartController.clearCart);

module.exports = router;
