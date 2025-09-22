"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCar = exports.updateCar = exports.getCarById = exports.getCars = exports.createCar = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Car_1 = __importDefault(require("../models/Car"));
exports.createCar = (0, express_async_handler_1.default)(async (req, res) => {
    const { brand, carModel, year, price, description, fuelType, mileage, images, transmission, condition, engine, } = req.body;
    const car = await Car_1.default.create({
        brand,
        carModel,
        year,
        price,
        description,
        fuelType,
        mileage,
        images,
        transmission,
        condition,
        engine,
        createdBy: req.user.id,
    });
    res.status(201).json(car);
});
exports.getCars = (0, express_async_handler_1.default)(async (_req, res) => {
    const cars = await Car_1.default.find().populate("createdBy", "name");
    res.json(cars);
});
// @desc Get single car by ID
// @route GET /api/cars/:id
// @access Public
exports.getCarById = (0, express_async_handler_1.default)(async (req, res) => {
    const car = await Car_1.default.findById(req.params.id).populate("createdBy", "name");
    if (car) {
        res.json(car);
    }
    else {
        res.status(404);
        throw new Error("Car not founds");
    }
});
// @desc Update car (Admin only)
// @route PUT /api/cars/:id
// @access Private/Admin
exports.updateCar = (0, express_async_handler_1.default)(async (req, res) => {
    const { brand, carModel, year, price, description, fuelType, mileage, images, transmission, condition, engine, } = req.body;
    const car = await Car_1.default.findById(req.params.id);
    if (!car) {
        res.status(404);
        throw new Error("Car not found");
    }
    car.brand = brand ?? car.brand;
    car.carModel = carModel ?? car.carModel;
    car.year = year ?? car.year;
    car.price = price ?? car.price;
    car.description = description ?? car.description;
    car.fuelType = fuelType ?? car.fuelType;
    car.images = images ?? car.images;
    car.transmission = transmission ?? car.transmission;
    car.mileage = mileage ?? car.mileage;
    car.condition = condition ?? car.condition;
    car.engine = engine ?? car.engine;
    const updatedCar = await car.save();
    res.json(updatedCar);
});
exports.deleteCar = (0, express_async_handler_1.default)(async (req, res) => {
    const car = await Car_1.default.findById(req.params.id);
    if (!car) {
        res.status(404);
        throw new Error("Car not found");
    }
    await car.deleteOne();
    res.json({ message: "Car removed" });
});
