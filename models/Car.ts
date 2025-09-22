// import mongoose, { Schema, Document } from "mongoose";

// interface ICar extends Document {
//   title: string;
//   brand: string;
//   model: string;
//   year: number;
//   price: number;
//   images: string[];
//   description: string;
//   createdBy: mongoose.Types.ObjectId;
// }

// const carSchema = new Schema<ICar>(
//   {
//     title: { type: String, required: true },
//     brand: { type: String, required: true },
//     model: { type: String, required: true },
//     year: { type: Number, required: true },
//     price: { type: Number, required: true },
//     images: { type: [String], required: true },
//     description: { type: String, required: true },
//     createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
//   },
//   { timestamps: true }
// );

// const Car = mongoose.model<ICar>("Car", carSchema);
// export default Car;

import mongoose, { Schema, Document } from "mongoose";

export interface ICar extends Document {
  _id: mongoose.Types.ObjectId;
  brand: string;
  carModel: string; // renamed to avoid conflict
  year: number;
  price: number;
  images: string[];
  transmission: string;
  description: string;
  fuelType: string;
  mileage: number;
  condition: string;
  engine: string;
  createdBy: mongoose.Types.ObjectId;
}

const carSchema = new Schema<ICar>(
  {
    brand: { type: String, required: true },
    carModel: { type: String, required: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    transmission: { type: String },
    mileage: { type: Number },
    description: { type: String },
    fuelType: { type: String },
    condition: { type: String },
    engine: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Car = mongoose.model<ICar>("Car", carSchema);
export default Car;
