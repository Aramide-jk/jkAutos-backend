"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("./server"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("./models/User"));
const Car_1 = __importDefault(require("./models/Car"));
const Purchase_1 = __importDefault(require("./models/Purchase"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const axios_mock_adapter_1 = __importDefault(require("axios-mock-adapter"));
const mock = new axios_mock_adapter_1.default(axios_1.default);
describe("Purchase Routes", () => {
    let token;
    let userId;
    let carId;
    beforeEach(async () => {
        const user = await User_1.default.create({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
        });
        // userId = user._id;
        userId = user._id;
        token = jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        const car = await Car_1.default.create({
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
                    reference: new mongoose_1.default.Types.ObjectId().toString(),
                },
            };
            mock
                .onPost("https://api.paystack.co/transaction/initialize")
                .reply(200, paystackResponse);
            const res = await (0, supertest_1.default)(server_1.default)
                .post("/api/purchases")
                .set("Authorization", `Bearer ${token}`)
                .send({ carId: carId.toString() });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("url", paystackResponse.data.authorization_url);
            // Verify that a pending purchase was created in the database
            const purchase = await Purchase_1.default.findOne({ user: userId, car: carId });
            expect(purchase).not.toBeNull();
            expect(purchase === null || purchase === void 0 ? void 0 : purchase.status).toBe("pending");
        });
        it("should return 401 if user is not authenticated", async () => {
            const res = await (0, supertest_1.default)(server_1.default)
                .post("/api/purchases")
                .send({ carId: carId.toString() });
            expect(res.status).toBe(401);
        });
        it("should return 404 if car is not found", async () => {
            const invalidCarId = new mongoose_1.default.Types.ObjectId();
            const res = await (0, supertest_1.default)(server_1.default)
                .post("/api/purchases")
                .set("Authorization", `Bearer ${token}`)
                .send({ carId: invalidCarId.toString() });
            expect(res.status).toBe(404);
            expect(res.body.message).toBe("Car not found");
        });
    });
    describe("GET /api/purchases/my-purchases", () => {
        it("should get the logged-in user's purchases", async () => {
            await Purchase_1.default.create({
                user: userId,
                car: carId,
                totalPrice: 25000,
                status: "paid",
            });
            const res = await (0, supertest_1.default)(server_1.default)
                .get("/api/purchases/my-purchases")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body.length).toBe(1);
            expect(res.body[0].user.toString()).toBe(userId.toString());
        });
        it("should return 401 if user is not authenticated", async () => {
            const res = await (0, supertest_1.default)(server_1.default).get("/api/purchases/my-purchases");
            expect(res.status).toBe(401);
        });
    });
});
