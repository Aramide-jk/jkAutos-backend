import { Router } from "express";
import {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
} from "../controllers/carController";
import { protect } from "../middleware/authMidlleware";

const router = Router();

// Cars CRUD
router.post("/", protect, createCar);
router.get("/", getCars);
router.get("/:id", getCarById);
router.put("/:id", protect, updateCar);
router.delete("/:id", protect, deleteCar);

export default router;
