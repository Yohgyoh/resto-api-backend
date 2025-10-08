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

// 1. Konfigurasi CORS Super Spesifik
const corsOptions = {
  origin: "*", // Izinkan SEMUA origin. Nanti kalo udah punya domain frontend, bisa diganti jadi 'https://domain-frontend-lo.com'
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// 2. Keamanan Lainnya
app.use(helmet()); // Set HTTP headers yang aman

const limiter = rateLimit({
  max: 100, // Maksimal 100 request per 15 menit dari satu IP
  windowMs: 15 * 60 * 1000,
  message: "Terlalu banyak request dari IP ini, coba lagi dalam 15 menit!",
});
app.use("/api", limiter); // Terapin ke semua rute yang diawali /api

// 3. Body Parser (buat ngebaca req.body dari JSON)
app.use(express.json({ limit: "10kb" })); // Batasi ukuran body request jadi 10kb

// 4. Logger (buat liat request yang masuk di terminal)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// --- RUTE ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// --- ERROR HANDLING (WAJIB PALING BAWAH) ---

// Handler untuk rute yang gak ada (404 Not Found)
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// "UGD" buat semua error yang terjadi di aplikasi
app.use(globalErrorHandler);

export default app;
