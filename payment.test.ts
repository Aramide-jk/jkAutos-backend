import request from "supertest";
import app from "./server";
import mongoose from "mongoose";
import User from "./models/User";
import Car, { ICar } from "./models/Car";
import Purchase, { IPurchase } from "./models/Purchase";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Payment Routes", () => {
  let purchase: IPurchase;
  let userId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    userId = user._id;

    const car: ICar = await Car.create({
      brand: "Honda",
      carModel: "Civic",
      year: 2021,
      price: 22000,
      description: "A compact car",
      createdBy: userId,
    });

    purchase = await Purchase.create({
      user: user._id,
      car: car._id,
      totalPrice: car.price,
      status: "pending",
    });

    process.env.PAYSTACK_SECRET_KEY = "sk_test_dummykey";
    process.env.CLIENT_URL = "http://localhost:3000";
  });

  describe("GET /api/payment/paystack/callback", () => {
    it("should verify payment and update purchase status to paid", async () => {
      const reference = purchase._id.toString();
      const paystackVerifyResponse = {
        status: true,
        data: {
          status: "success",
          reference: reference,
        },
      };

      mock
        .onGet(`https://api.paystack.co/transaction/verify/${reference}`)
        .reply(200, paystackVerifyResponse);

      const res = await request(app).get(
        `/api/payment/paystack/callback?reference=${reference}`
      );

      expect(res.status).toBe(302); // Expect a redirect
      expect(res.header.location).toBe(
        `${process.env.CLIENT_URL}/purchase-success?ref=${reference}`
      );

      const updatedPurchase = await Purchase.findById(purchase._id);
      expect(updatedPurchase?.status).toBe("paid");
      expect(updatedPurchase?.paymentReference).toBe(reference);
    });

    it("should redirect to failure page if reference is missing", async () => {
      const res = await request(app).get("/api/payment/paystack/callback");

      expect(res.status).toBe(302);
      expect(res.header.location).toBe(
        `${process.env.CLIENT_URL}/purchase-failed`
      );
    });
  });
});
