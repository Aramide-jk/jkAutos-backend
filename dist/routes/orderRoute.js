"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const authMidlleware_1 = require("../middleware/authMidlleware");
const router = express_1.default.Router();
// User routes
router.post("/", authMidlleware_1.protect, orderController_1.createOrder);
router.get("/my-orders", authMidlleware_1.protect, orderController_1.getUserOrders);
// Admin routes
router.get("/", authMidlleware_1.protect, authMidlleware_1.adminOnly, orderController_1.getAllOrders);
router.put("/:id/status", authMidlleware_1.protect, authMidlleware_1.adminOnly, orderController_1.updateOrderStatus);
exports.default = router;
