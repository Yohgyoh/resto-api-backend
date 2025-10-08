import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import globalErrorHandler from "./controllers/errorController.js";

const app = express();

// --- GLOBAL MIDDLEWARE ---

app.use((req, res, next) => {
  // Izinkan semua origin.
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Izinkan header yang boleh dikirim client
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Izinkan metode HTTP yang boleh dipake
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );

  // Jalur VVIP khusus buat pre-flight request (OPTIONS)
  // Kalo ada request OPTIONS, langsung jawab 200 OK dan stop.
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Terlalu banyak request dari IP ini. Coba lagi nanti ya.",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));

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
app.use(globalErrorHandler);
