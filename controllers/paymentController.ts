import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import axios from "axios";
import crypto from "crypto";
import Purchase from "../models/Purchase";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY as string;

// @desc Handle Paystack callback
// @route GET /api/payment/paystack/callback
// @access Public
export const handlePaystackCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const { reference } = req.query;

    if (!reference) {
      // Redirect to a failure page on the frontend
      return res.redirect(`${process.env.CLIENT_URL}/purchase-failed`);
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, data } = response.data;

    if (status && data.status === "success") {
      const purchaseId = data.reference;
      const purchase = await Purchase.findById(purchaseId);

      if (purchase && purchase.status === "pending") {
        purchase.status = "paid";
        purchase.paymentReference = reference as string;
        await purchase.save();
        console.log(`Purchase ${purchaseId} updated to paid.`);
      }

      // Redirect to a success page on the frontend
      return res.redirect(
        `${process.env.CLIENT_URL}/purchase-success?ref=${reference}`
      );
    }

    // Redirect to a failure page if verification fails
    res.redirect(`${process.env.CLIENT_URL}/purchase-failed`);
  }
);
