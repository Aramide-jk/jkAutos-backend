"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const purchaseController_1 = require("../controllers/purchaseController");
const authMidlleware_1 = require("../middleware/authMidlleware");
const router = express_1.default.Router();
// User routes
router.post("/", authMidlleware_1.protect, purchaseController_1.createPurchase);
router.get("/my-purchases", authMidlleware_1.protect, purchaseController_1.getUserPurchases);
// Admin routes
router.get("/", authMidlleware_1.protect, authMidlleware_1.adminOnly, purchaseController_1.getAllPurchases);
router.put("/:id/status", authMidlleware_1.protect, authMidlleware_1.adminOnly, purchaseController_1.updatePurchaseStatus);
exports.default = router;
