const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { verify } = require("../auth");

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Routes requiring authentication
router.use(verify); // all routes below require login

router.get("/details", userController.getProfile);
router.patch("/update-password", userController.updatePassword);

// Admin-only routes (still requires verify; optionally you can add verifyAdmin)
router.patch("/:id/set-as-admin", userController.setAsAdmin);

module.exports = router;
