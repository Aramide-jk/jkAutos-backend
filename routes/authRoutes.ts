import { Router } from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/authController";
import { protect } from "../middleware/authMidlleware";

const router = Router();

// Public
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private
router.get("/profile", protect, getProfile);

export default router;
