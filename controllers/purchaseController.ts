import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Purchase, { IPurchase } from "../models/Purchase";
import Car from "../models/Car";
import axios from "axios";

// @desc    Create a new purchase (buy a car)
// @route   POST /api/purchases
// @access  Private
export const createPurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const { carId } = req.body;
    const user = (req as any).user;

    if (!process.env.PAYSTACK_SECRET_KEY) {
      res.status(500);
      throw new Error("Paystack secret key not configured.");
    }

    console.log("Received request to purchase car with body:", req.body);

    if (!carId || !mongoose.Types.ObjectId.isValid(carId)) {
      res.status(400);
      throw new Error("Invalid or missing carId");
    }

    const car = await Car.findById(carId);
    if (!car) {
      res.status(404);
      throw new Error("Car not found");
    }

    // Create a pending purchase record first
    const purchase: IPurchase = await Purchase.create({
      user: user.id,
      car: carId,
      totalPrice: car.price, // Using car's price for the order total
      status: "pending",
    });

    // Initialize Paystack Transaction
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: Math.round(car.price * 100), // Amount in kobo (NGN) or cents (USD)
        // currency: "NGN", // or "USD", "GHS", etc.
        reference: purchase.id.toString(), // Use our purchase ID as the reference
        callback_url: `${process.env.SERVER_URL}/api/payment/paystack/callback`,
        metadata: {
          purchaseId: purchase.id.toString(),
          userId: user.id,
          carId: car._id.toString(),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { authorization_url } = paystackResponse.data.data;

    res.status(200).json({ url: authorization_url });
  }
);

// @desc    Get logged in user's purchases
// @route   GET /api/purchases/my-purchases
// @access  Private
export const getUserPurchases = asyncHandler(
  async (req: Request, res: Response) => {
    const purchases = await Purchase.find({ user: (req as any).user.id })
      .populate("car")
      .sort({ createdAt: -1 });

    res.json(purchases);
  }
);

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private/Admin
export const getAllPurchases = asyncHandler(
  async (_req: Request, res: Response) => {
    const purchases = await Purchase.find()
      .populate("user", "name email")
      .populate("car")
      .sort({ createdAt: -1 });

    res.json(purchases);
  }
);

// @desc    Update purchase status
// @route   PUT /api/purchases/:id/status
// @access  Private/Admin
export const updatePurchaseStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { status } = req.body;

    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      res.status(404);
      throw new Error("Purchase not found");
    }

    purchase.status = status ?? purchase.status;
    const updatedPurchase = await purchase.save();

    res.json(updatedPurchase);
  }
);
