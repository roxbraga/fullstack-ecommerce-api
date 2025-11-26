const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");
const { verify, verifyAdmin } = require("../auth");

// Public routes
router.post("/search-by-name", productController.searchByName);
router.post("/search-by-price", productController.searchByPrice);
router.get("/active", productController.getAllActiveProducts);

// Admin-only routes
router.use(verify, verifyAdmin); // all routes below require admin

router.get("/all", productController.getAllProducts);
router.post("/", productController.addProduct);
router.patch("/:productId/update", productController.updateProduct);
router.patch("/:productId/archive", productController.archiveProduct);
router.patch("/:productId/activate", productController.activateProduct);

// Authenticated users can get single product info
router.get("/:productId", verify, productController.getProduct);

module.exports = router;
