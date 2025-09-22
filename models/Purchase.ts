import mongoose, { Schema, Document } from "mongoose";
import { ICar } from "./Car";
import { IUser } from "./User";

export interface IPurchase extends Document {
  user: IUser["_id"];
  car: ICar["_id"];
  totalPrice: number;
  status: "pending" | "paid" | "cancelled";
  paymentReference?: string; // To store the Paystack transaction reference
}

const purchaseSchema = new Schema<IPurchase>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    car: { type: Schema.Types.ObjectId, ref: "Car", required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    paymentReference: { type: String },
  },
  { timestamps: true }
);

const Purchase = mongoose.model<IPurchase>("Purchase", purchaseSchema);
export default Purchase;
