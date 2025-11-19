const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");
const auth = require("../auth");
const { verify, verifyAdmin } = auth;

// Public Routes

// Create Product (Admin only)
router.post("/", verify, verifyAdmin, productController.addProduct);

// Retrieve all products (Public)
router.get("/all", productController.getAllProducts);

// Retrieve all active products (Protected)
router.get("/active", verify, productController.getAllActiveProducts);

// Retrieve single product
router.get("/:productId", verify, productController.getProduct);

// Update Product info (Admin only)
router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);

// Archive product (Admin only)
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

// Activate product (Admin only)
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

module.exports = router;
