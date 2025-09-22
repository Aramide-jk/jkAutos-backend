"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const carController_1 = require("../controllers/carController");
const authMidlleware_1 = require("../middleware/authMidlleware");
const router = (0, express_1.Router)();
// Cars CRUD
router.post("/", authMidlleware_1.protect, carController_1.createCar);
router.get("/", carController_1.getCars);
router.get("/:id", carController_1.getCarById);
router.put("/:id", authMidlleware_1.protect, carController_1.updateCar);
router.delete("/:id", authMidlleware_1.protect, carController_1.deleteCar);
exports.default = router;
