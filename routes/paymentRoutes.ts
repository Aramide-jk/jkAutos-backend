import { Router } from "express";
import { handlePaystackCallback } from "../controllers/paymentController";

const router = Router();

// Paystack callback endpoint
router.get("/paystack/callback", handlePaystackCallback);

export default router;
