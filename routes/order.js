const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order");
const { verify, verifyAdmin } = require("../auth");

// Checkout user cart
router.post("/checkout", verify, orderController.checkout);

// Get logged-in user's orders
router.get("/my-orders", verify, orderController.getMyOrders);

// Get all orders (admin only)
router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);

module.exports = router;
