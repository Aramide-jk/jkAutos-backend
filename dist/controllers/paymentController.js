"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaystackCallback = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const axios_1 = __importDefault(require("axios"));
const Purchase_1 = __importDefault(require("../models/Purchase"));
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
// @desc Handle Paystack callback
// @route GET /api/payment/paystack/callback
// @access Public
exports.handlePaystackCallback = (0, express_async_handler_1.default)(async (req, res) => {
    const { reference } = req.query;
    if (!reference) {
        // Redirect to a failure page on the frontend
        return res.redirect(`${process.env.CLIENT_URL}/purchase-failed`);
    }
    const response = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
    });
    const { status, data } = response.data;
    if (status && data.status === "success") {
        const purchaseId = data.reference;
        const purchase = await Purchase_1.default.findById(purchaseId);
        if (purchase && purchase.status === "pending") {
            purchase.status = "paid";
            purchase.paymentReference = reference;
            await purchase.save();
            console.log(`Purchase ${purchaseId} updated to paid.`);
        }
        // Redirect to a success page on the frontend
        return res.redirect(`${process.env.CLIENT_URL}/purchase-success?ref=${reference}`);
    }
    // Redirect to a failure page if verification fails
    res.redirect(`${process.env.CLIENT_URL}/purchase-failed`);
});
