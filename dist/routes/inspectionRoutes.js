"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inspectionController_1 = require("../controllers/inspectionController");
const authMidlleware_1 = require("../middleware/authMidlleware");
const router = (0, express_1.Router)();
// Book inspection (user)
router.post("/", authMidlleware_1.protect, inspectionController_1.bookInspection);
// Get logged-in user's inspections
router.get("/my-inspections", authMidlleware_1.protect, inspectionController_1.getUserInspections);
// Get all inspections (admin only)
router.get("/", authMidlleware_1.protect, authMidlleware_1.adminOnly, inspectionController_1.getAllInspections);
// Update inspection status (admin only)
router.put("/:id/status", authMidlleware_1.protect, authMidlleware_1.adminOnly, inspectionController_1.updateInspectionStatus);
exports.default = router;
