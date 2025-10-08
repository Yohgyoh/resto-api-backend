// app.js (Versi Final & Bersih)
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import globalErrorHandler from "./controllers/errorController.js";

const app = express();

// --- GLOBAL MIDDLEWARE ---

// 1. CORS (PALING ATAS)
// Izinkan SEMUA pre-flight request (`OPTIONS`) dari origin manapun
app.options("/*", cors());
app.use(cors());

// 2. Keamanan Lainnya
app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Terlalu banyak request dari IP ini. Coba lagi nanti ya.",
});
app.use("/api", limiter);

// 3. Body Parser
app.use(express.json({ limit: "10kb" }));

// 4. Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// --- RUTE ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// --- ERROR HANDLING ---
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});
app.use(globalErrorHandler);

export default app;
