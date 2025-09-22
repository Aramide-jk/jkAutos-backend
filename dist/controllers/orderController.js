"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.getUserOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Car_1 = __importDefault(require("../models/Car"));
// @desc Create a new order (buy a car)
// @route POST /api/orders
// @access Private/User
const createOrder = async (req, res) => {
    try {
        const { carId } = req.body;
        const car = await Car_1.default.findById(carId);
        if (!car) {
            return res.status(404).json({ message: "Car not found" });
        }
        const order = await Order_1.default.create({
            user: req.user.id,
            car: carId,
            status: "pending",
        });
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createOrder = createOrder;
const getUserOrders = async (req, res) => {
    try {
        const orders = await Order_1.default.find({ user: req.user.id })
            .populate("car")
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUserOrders = getUserOrders;
const getAllOrders = async (_req, res) => {
    try {
        const orders = await Order_1.default.find()
            .populate("user", "name email")
            .populate("car")
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllOrders = getAllOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = status || order.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateOrderStatus = updateOrderStatus;
