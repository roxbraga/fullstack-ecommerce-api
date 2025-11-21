const express = require("express");
const router = express.Router();
const productController = require("../controllers/product");
const { verify, verifyAdmin } = require("../auth");

router.post("/search-by-name", productController.searchByName);
router.post("/search-by-price", productController.searchByPrice);

router.get("/all", productController.getAllProducts);
router.get("/active", productController.getAllActiveProducts);

router.post("/", verify, verifyAdmin, productController.addProduct);

router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

router.get("/:productId", verify, productController.getProduct);

module.exports = router;
