import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import carRoutes from "./routes/carRoutes";
import purchaseRoutes from "./routes/purchaseRoute";
import inspectionRoutes from "./routes/inspectionRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://jkautoss.netlify.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/payment", paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
  });
}

export default app;
