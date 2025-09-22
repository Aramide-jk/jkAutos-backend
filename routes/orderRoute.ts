import express from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController";
import { protect, adminOnly } from "../middleware/authMidlleware";

const router = express.Router();

// User routes
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getUserOrders);

// Admin routes
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
