import request from "supertest";
import app from "./server";
import mongoose from "mongoose";
import User from "./models/User";
import Car, { ICar } from "./models/Car";
import Purchase from "./models/Purchase";
import jwt from "jsonwebtoken";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Purchase Routes", () => {
  let token: string;
  let userId: mongoose.Types.ObjectId;
  let carId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    // userId = user._id;
    userId = user._id as mongoose.Types.ObjectId;
    token = jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const car: ICar = await Car.create({
      brand: "Toyota",
      carModel: "Camry",
      year: 2022,
      price: 25000,
      description: "A reliable sedan",
      images: ["image1.jpg"],
      createdBy: userId,
    });
    carId = car._id;

    // Set environment variables for Paystack
    process.env.PAYSTACK_SECRET_KEY = "sk_test_dummykey";
    process.env.SERVER_URL = "http://localhost:5000";
  });

  describe("POST /api/purchases", () => {
    it("should create a purchase and return a Paystack authorization URL", async () => {
      const paystackResponse = {
        status: true,
        message: "Authorization URL created",
        data: {
          authorization_url: "https://checkout.paystack.com/hpej2024",
          access_code: "hpej2024",
          reference: new mongoose.Types.ObjectId().toString(),
        },
      };

      mock
        .onPost("https://api.paystack.co/transaction/initialize")
        .reply(200, paystackResponse);

      const res = await request(app)
        .post("/api/purchases")
        .set("Authorization", `Bearer ${token}`)
        .send({ carId: carId.toString() });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "url",
        paystackResponse.data.authorization_url
      );

      // Verify that a pending purchase was created in the database
      const purchase = await Purchase.findOne({ user: userId, car: carId });
      expect(purchase).not.toBeNull();
      expect(purchase?.status).toBe("pending");
    });

    it("should return 401 if user is not authenticated", async () => {
      const res = await request(app)
        .post("/api/purchases")
        .send({ carId: carId.toString() });

      expect(res.status).toBe(401);
    });

    it("should return 404 if car is not found", async () => {
      const invalidCarId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post("/api/purchases")
        .set("Authorization", `Bearer ${token}`)
        .send({ carId: invalidCarId.toString() });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Car not found");
    });
  });

  describe("GET /api/purchases/my-purchases", () => {
    it("should get the logged-in user's purchases", async () => {
      await Purchase.create({
        user: userId,
        car: carId,
        totalPrice: 25000,
        status: "paid",
      });

      const res = await request(app)
        .get("/api/purchases/my-purchases")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].user.toString()).toBe(userId.toString());
    });

    it("should return 401 if user is not authenticated", async () => {
      const res = await request(app).get("/api/purchases/my-purchases");
      expect(res.status).toBe(401);
    });
  });
});
