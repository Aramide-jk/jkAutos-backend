"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const carRoutes_1 = __importDefault(require("./routes/carRoutes"));
const purchaseRoute_1 = __importDefault(require("./routes/purchaseRoute"));
const inspectionRoutes_1 = __importDefault(
  require("./routes/inspectionRoutes")
);
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(
  (0, cors_1.default)({
    origin: "https://jkautoss.netlify.app/ || http://localhost:5173",
  })
);
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/cars", carRoutes_1.default);
app.use("/api/purchases", purchaseRoute_1.default);
app.use("/api/inspections", inspectionRoutes_1.default);
app.use("/api/payment", paymentRoutes_1.default);
app.use(errorMiddleware_1.notFound);
app.use(errorMiddleware_1.errorHandler);
const PORT = process.env.PORT || 5000;
// Start server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running in development mode on port ${PORT}`);
  });
}
exports.default = app;
