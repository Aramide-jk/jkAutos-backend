"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMidlleware_1 = require("../middleware/authMidlleware");
const router = (0, express_1.Router)();
// Public
router.post("/register", authController_1.registerUser);
router.post("/login", authController_1.loginUser);
// Private
router.get("/profile", authMidlleware_1.protect, authController_1.getProfile);
exports.default = router;
