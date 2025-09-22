"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("./server"));
const User_1 = __importDefault(require("./models/User"));
const Car_1 = __importDefault(require("./models/Car"));
const Purchase_1 = __importDefault(require("./models/Purchase"));
const axios_1 = __importDefault(require("axios"));
const axios_mock_adapter_1 = __importDefault(require("axios-mock-adapter"));
const mock = new axios_mock_adapter_1.default(axios_1.default);
describe("Payment Routes", () => {
    let purchase;
    let userId;
    beforeEach(async () => {
        const user = await User_1.default.create({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
        });
        // userId = user._id;
        userId = user._id;
        const car = await Car_1.default.create({
            brand: "Honda",
            carModel: "Civic",
            year: 2021,
            price: 22000,
            description: "A compact car",
            createdBy: userId,
        });
        purchase = await Purchase_1.default.create({
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
            const reference = purchase?._id?.toString();
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
            const res = await (0, supertest_1.default)(server_1.default).get(`/api/payment/paystack/callback?reference=${reference}`);
            expect(res.status).toBe(302); // Expect a redirect
            expect(res.header.location).toBe(`${process.env.CLIENT_URL}/purchase-success?ref=${reference}`);
            const updatedPurchase = await Purchase_1.default.findById(purchase._id);
            expect(updatedPurchase?.status).toBe("paid");
            expect(updatedPurchase?.paymentReference).toBe(reference);
        });
        it("should redirect to failure page if reference is missing", async () => {
            const res = await (0, supertest_1.default)(server_1.default).get("/api/payment/paystack/callback");
            expect(res.status).toBe(302);
            expect(res.header.location).toBe(`${process.env.CLIENT_URL}/purchase-failed`);
        });
    });
});
