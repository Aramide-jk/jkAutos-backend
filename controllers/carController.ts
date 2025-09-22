import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Car from "../models/Car";

export const createCar = asyncHandler(async (req: Request, res: Response) => {
  const {
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
  } = req.body;

  const car = await Car.create({
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
    createdBy: (req as any).user.id,
  });

  res.status(201).json(car);
});

export const getCars = asyncHandler(async (_req: Request, res: Response) => {
  const cars = await Car.find().populate("createdBy", "name");
  res.json(cars);
});

// @desc Get single car by ID
// @route GET /api/cars/:id
// @access Public
export const getCarById = asyncHandler(async (req: Request, res: Response) => {
  const car = await Car.findById(req.params.id).populate("createdBy", "name");
  if (car) {
    res.json(car);
  } else {
    res.status(404);
    throw new Error("Car not founds");
  }
});

// @desc Update car (Admin only)
// @route PUT /api/cars/:id
// @access Private/Admin
export const updateCar = asyncHandler(async (req: Request, res: Response) => {
  const {
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
  } = req.body;

  const car = await Car.findById(req.params.id);
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

export const deleteCar = asyncHandler(async (req: Request, res: Response) => {
  const car = await Car.findById(req.params.id);
  if (!car) {
    res.status(404);
    throw new Error("Car not found");
  }

  await car.deleteOne();
  res.json({ message: "Car removed" });
});
