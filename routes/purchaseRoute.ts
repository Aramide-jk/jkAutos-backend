import express from "express";
import {
  createPurchase,
  getUserPurchases,
  getAllPurchases,
  updatePurchaseStatus,
} from "../controllers/purchaseController";
import { protect, adminOnly } from "../middleware/authMidlleware";

const router = express.Router();

// User routes
router.post("/", protect, createPurchase);
router.get("/my-purchases", protect, getUserPurchases);

// Admin routes
router.get("/", protect, adminOnly, getAllPurchases);
router.put("/:id/status", protect, adminOnly, updatePurchaseStatus);

export default router;
