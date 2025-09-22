"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePurchaseStatus = exports.getAllPurchases = exports.getUserPurchases = exports.createPurchase = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const Car_1 = __importDefault(require("../models/Car"));
const axios_1 = __importDefault(require("axios"));
// @desc    Create a new purchase (buy a car)
// @route   POST /api/purchases
// @access  Private
exports.createPurchase = (0, express_async_handler_1.default)(async (req, res) => {
    const { carId } = req.body;
    const user = req.user;
    if (!process.env.PAYSTACK_SECRET_KEY) {
        res.status(500);
        throw new Error("Paystack secret key not configured.");
    }
    console.log("Received request to purchase car with body:", req.body);
    if (!carId || !mongoose_1.default.Types.ObjectId.isValid(carId)) {
        res.status(400);
        throw new Error("Invalid or missing carId");
    }
    const car = await Car_1.default.findById(carId);
    if (!car) {
        res.status(404);
        throw new Error("Car not found");
    }
    // Create a pending purchase record first
    const purchase = await Purchase_1.default.create({
        user: user.id,
        car: carId,
        totalPrice: car.price, // Using car's price for the order total
        status: "pending",
    });
    // Initialize Paystack Transaction
    const paystackResponse = await axios_1.default.post("https://api.paystack.co/transaction/initialize", {
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
    }, {
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
        },
    });
    const { authorization_url } = paystackResponse.data.data;
    res.status(200).json({ url: authorization_url });
});
// @desc    Get logged in user's purchases
// @route   GET /api/purchases/my-purchases
// @access  Private
exports.getUserPurchases = (0, express_async_handler_1.default)(async (req, res) => {
    const purchases = await Purchase_1.default.find({ user: req.user.id })
        .populate("car")
        .sort({ createdAt: -1 });
    res.json(purchases);
});
// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private/Admin
exports.getAllPurchases = (0, express_async_handler_1.default)(async (_req, res) => {
    const purchases = await Purchase_1.default.find()
        .populate("user", "name email")
        .populate("car")
        .sort({ createdAt: -1 });
    res.json(purchases);
});
// @desc    Update purchase status
// @route   PUT /api/purchases/:id/status
// @access  Private/Admin
exports.updatePurchaseStatus = (0, express_async_handler_1.default)(async (req, res) => {
    const { status } = req.body;
    const purchase = await Purchase_1.default.findById(req.params.id);
    if (!purchase) {
        res.status(404);
        throw new Error("Purchase not found");
    }
    purchase.status = status !== null && status !== void 0 ? status : purchase.status;
    const updatedPurchase = await purchase.save();
    res.json(updatedPurchase);
});
