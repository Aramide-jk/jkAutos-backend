import mongoose, { Schema, Document } from "mongoose";

export interface IInspection extends Document {
  user: mongoose.Types.ObjectId;
  car: mongoose.Types.ObjectId;
  date: Date;
  status: "pending" | "approved" | "completed" | "cancelled";
}

const inspectionSchema = new Schema<IInspection>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    car: { type: Schema.Types.ObjectId, ref: "Car", required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Inspection = mongoose.model<IInspection>("Inspection", inspectionSchema);
export default Inspection;
