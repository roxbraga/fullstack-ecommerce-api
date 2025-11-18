const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { verify, isLoggedIn } = require("../auth");

// Public Routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Authenticated User Routes
router.get("/details", verify, userController.getProfile);
router.patch("/update-password", verify, userController.updatePassword);

// Admin Only Route
router.patch("/:id/set-as-admin", verify, userController.setAsAdmin);

module.exports = router;
