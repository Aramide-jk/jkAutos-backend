import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Inspection from "../models/Inspection";
import Car from "../models/Car";

// @desc Book a car inspection
// @route POST /api/inspections
// @access Private/User
export const bookInspection = asyncHandler(
  async (req: Request, res: Response) => {
    const { carId, date } = req.body;

    // Log the incoming request body to debug
    console.log("Received request to book inspection with body:", req.body);

    if (!carId || !mongoose.Types.ObjectId.isValid(carId)) {
      res.status(400);
      throw new Error("Invalid or missing carId");
    }

    const car = await Car.findById(carId);
    if (!car) {
      res.status(404);
      throw new Error("Car not found");
    }

    const inspection = await Inspection.create({
      user: (req as any).user.id,
      car: carId,
      date,
      status: "pending",
    });

    res.status(201).json(inspection);
  }
);

// @desc Get logged-in user’s inspections
// @route GET /api/inspections/my-inspections
// @access Private/User
export const getUserInspections = asyncHandler(
  async (req: Request, res: Response) => {
    const inspections = await Inspection.find({ user: (req as any).user.id })
      .populate("car")
      .sort({ date: 1 });

    res.json(inspections);
  }
);

// @desc Get all inspections (admin only)
// @route GET /api/inspections
// @access Private/Admin
export const getAllInspections = asyncHandler(
  async (_req: Request, res: Response) => {
    const inspections = await Inspection.find()
      .populate("user", "name email")
      .populate("car")
      .sort({ date: 1 });

    res.json(inspections);
  }
);

// @desc Update inspection status (admin only)
// @route PUT /api/inspections/:id/status
// @access Private/Admin
export const updateInspectionStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { status } = req.body;

    const inspection = await Inspection.findById(req.params.id);
    if (!inspection) {
      res.status(404);
      throw new Error("Inspection not found");
    }

    inspection.status = status ?? inspection.status;
    const updatedInspection = await inspection.save();

    res.json(updatedInspection);
  }
);
