import { Router } from "express";
import {
  bookInspection,
  getUserInspections,
  getAllInspections,
  updateInspectionStatus,
} from "../controllers/inspectionController";
import { protect, adminOnly } from "../middleware/authMidlleware";

const router = Router();

// Book inspection (user)
router.post("/", protect, bookInspection);

// Get logged-in user's inspections
router.get("/my-inspections", protect, getUserInspections);

// Get all inspections (admin only)
router.get("/", protect, adminOnly, getAllInspections);

// Update inspection status (admin only)
router.put("/:id/status", protect, adminOnly, updateInspectionStatus);

export default router;
