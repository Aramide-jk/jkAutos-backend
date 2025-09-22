"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const router = (0, express_1.Router)();
// Paystack callback endpoint
router.get("/paystack/callback", paymentController_1.handlePaystackCallback);
exports.default = router;
