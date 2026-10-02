const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order");
const { verify, verifyAdmin } = require("../auth");

router.post("/checkout", verify, orderController.checkout);
router.get("/my-orders", verify, orderController.getMyOrders);
router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);
router.get('/abandoned', verify, verifyAdmin, orderController.getAbandonedOrders)
router.get('/draft', verify, verifyAdmin, orderController.getDraftOrders)
router.patch('/:id', verify, verifyAdmin, orderController.updateOrderStatus)
router.delete('/:id', verify, verifyAdmin, orderController.deleteOrder)
router.patch('/:id/cancel', verify, orderController.cancelOrder)


module.exports = router;