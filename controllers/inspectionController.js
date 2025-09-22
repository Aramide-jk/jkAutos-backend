"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInspectionStatus = exports.getAllInspections = exports.getUserInspections = exports.bookInspection = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const Inspection_1 = __importDefault(require("../models/Inspection"));
const Car_1 = __importDefault(require("../models/Car"));
// @desc Book a car inspection
// @route POST /api/inspections
// @access Private/User
exports.bookInspection = (0, express_async_handler_1.default)(async (req, res) => {
    const { carId, date } = req.body;
    // Log the incoming request body to debug
    console.log("Received request to book inspection with body:", req.body);
    if (!carId || !mongoose_1.default.Types.ObjectId.isValid(carId)) {
        res.status(400);
        throw new Error("Invalid or missing carId");
    }
    const car = await Car_1.default.findById(carId);
    if (!car) {
        res.status(404);
        throw new Error("Car not found");
    }
    const inspection = await Inspection_1.default.create({
        user: req.user.id,
        car: carId,
        date,
        status: "pending",
    });
    res.status(201).json(inspection);
});
// @desc Get logged-in user’s inspections
// @route GET /api/inspections/my-inspections
// @access Private/User
exports.getUserInspections = (0, express_async_handler_1.default)(async (req, res) => {
    const inspections = await Inspection_1.default.find({ user: req.user.id })
        .populate("car")
        .sort({ date: 1 });
    res.json(inspections);
});
// @desc Get all inspections (admin only)
// @route GET /api/inspections
// @access Private/Admin
exports.getAllInspections = (0, express_async_handler_1.default)(async (_req, res) => {
    const inspections = await Inspection_1.default.find()
        .populate("user", "name email")
        .populate("car")
        .sort({ date: 1 });
    res.json(inspections);
});
// @desc Update inspection status (admin only)
// @route PUT /api/inspections/:id/status
// @access Private/Admin
exports.updateInspectionStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const { status } = req.body;
    const inspection = await Inspection_1.default.findById(req.params.id);
    if (!inspection) {
        res.status(404);
        throw new Error("Inspection not found");
    }
    inspection.status = status ?? inspection.status;
    const updatedInspection = await inspection.save();
    res.json(updatedInspection);
});
