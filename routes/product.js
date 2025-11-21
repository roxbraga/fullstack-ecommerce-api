const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");
const { verify, verifyAdmin } = require("../auth");

// Search routes
router.get("/search-by-name", productController.searchByName);
router.get("/search-by-price", productController.searchByPriceRange);

// Get products
router.get("/all", productController.getAllProducts);
router.get("/active", productController.getAllActiveProducts);

// Admin create product
router.post("/", verify, verifyAdmin, productController.addProduct);

// Admin product operations
router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

// Single product (must be last)
router.get("/:productId", verify, productController.getProduct);

module.exports = router;
