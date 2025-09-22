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
    car.brand = brand !== null && brand !== void 0 ? brand : car.brand;
    car.carModel = carModel !== null && carModel !== void 0 ? carModel : car.carModel;
    car.year = year !== null && year !== void 0 ? year : car.year;
    car.price = price !== null && price !== void 0 ? price : car.price;
    car.description = description !== null && description !== void 0 ? description : car.description;
    car.fuelType = fuelType !== null && fuelType !== void 0 ? fuelType : car.fuelType;
    car.images = images !== null && images !== void 0 ? images : car.images;
    car.transmission = transmission !== null && transmission !== void 0 ? transmission : car.transmission;
    car.mileage = mileage !== null && mileage !== void 0 ? mileage : car.mileage;
    car.condition = condition !== null && condition !== void 0 ? condition : car.condition;
    car.engine = engine !== null && engine !== void 0 ? engine : car.engine;
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
