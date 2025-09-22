"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = exports.getProfile = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
// Generate JWT
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};
exports.registerUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { name, email, password, role } = req.body;
    // Check if user already exists
    const userExists = await User_1.default.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }
    const user = new User_1.default({
        name,
        email,
        password,
        role: role || "user",
    });
    await user.save();
    res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
    });
    console.log("User registered:", email);
});
exports.loginUser = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        console.warn("Login attempt with missing email/password");
        res.status(400);
        throw new Error("Email and password are required");
    }
    const user = await User_1.default.findOne({ email });
    if (!user) {
        res.status(401);
        throw new Error("Invalid credentials");
    }
    const isValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isValid) {
        res.status(401);
        throw new Error("Invalid credentials");
    }
    const token = generateToken(user.id, user.role);
    res.status(200).json({ user, token });
});
exports.getProfile = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.user.id).select("-password");
    if (user) {
        res.json(user);
    }
    else {
        res.status(404);
        throw new Error("User not found");
    }
});
// @desc Admin login (optional, but can reuse loginUser with role check)
exports.adminLogin = (0, express_async_handler_1.default)(async (req, res) => {
    const { email, password } = req.body;
    const admin = await User_1.default.findOne({ email, role: "admin" });
    if (admin && (await bcryptjs_1.default.compare(password, admin.password))) {
        res.json({
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin.id, admin.role),
        });
    }
    else {
        res.status(401);
        throw new Error("Invalid admin credentials");
    }
});
