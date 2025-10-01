// import express from "express";
// import userRoutes from "./routes/userRoutes.js";
// import mongoose from "mongoose";
// import { globalErrorHandling } from "./controllers/errorController.js";
// import authRoutes from "./routes/authRoutes.js";

// const app = express();

// //ini bagian middleware
// const logger = (req, res, next) => {
//    console.log(`--- 1. Request Masuk Logger ---`); // Tambahin ini
//   const waktuIndo = new Date().toLocaleString("id-ID", {
//     timeZone: "Asia/Jakarta",
//   });
//   console.log(`[${waktuIndo}] ${req.method} ${req.url}`);
//   next();
// };
// app.use(logger);
// app.use(express.json()); //by default expres ga tau apa itu json makanya harus make ini
// app.get("/", (req, res) => {
//   res.send("APP GWE UDH JALAN YA DER!!!!");
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);

// // Handler 404
// app.use((req, res, next) => {
//   res.status(404).json({
//     status: "fail",
//     message: `Can't find ${req.originalUrl} on this server!`,
//   });
// });

// // Global error handler (harus paling bawah)
// app.use(globalErrorHandling);

// export default app;
// //ini token={

// // "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4Yzk3ODQzZmQ0ZDc4NGU3NjAwMDY3NCIsImlhdCI6MTc1ODAzNDE0NSwiZXhwIjoxNzY1ODEwMTQ1fQ.9uZeskEHdecWRMTTcvItkWJ6zUafo7M0QFNihW-crdE"
// // ini email sama password
// {

//   "email": "usrewerer@example.com",
//   "password": "passwordpanjang"
// }
// import express from "express";
// import morgan from "morgan"; // Pake Morgan biar lebih pro
// import helmet from "helmet";
// import rateLimit from "express-rate-limit";
// import ExpressMongoSanitize from "express-mongo-sanitize";
// import xss from "xss-clean";

// import userRoutes from "./routes/userRoutes.js";
// import authRoutes from "./routes/authRoutes.js";
// import globalErrorHandler from "./controllers/errorController.js";

// const app = express();
// // CCTV #1: Cek apakah request masuk ke aplikasi
// app.use((req, res, next) => {
//   console.log('--- 1. Request sampai di app.js ---');
//   next();
// });

// // --- MIDDLEWARE ---
// app.use(helmet()); // Set HTTP headers yang aman
// const limiter = rateLimit({
//   max: 100, // Maksimal 100 request dalam 1 jam
//   windowMs: 60 * 60 * 1000, // 1 jam
//   message: "Terlalu banyak request dari IP ini. Coba lagi nanti ya.",
// });
// app.use("/api", limiter); // Terapin rate limiter ke semua rute yang diawali /api
// app.use(express.json({ limit: "10kb" })); // Batas ukuran body maksimal 10kb
// app.use(ExpressMongoSanitize()); // Bersihin data dari NoSQL injection
// app.use(xss()); // Bersihin data dari XSS injection

// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev")); // Logger canggih
// }

// // --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---// --- RUTE ---
// app.use("/api/users", userRoutes);
// app.use("/api/auth", authRoutes);

// // --- ERROR HANDLING ---
// app.use((req, res, next) => {
//   res.status(404).json({
//     status: "fail", // Boleh, value status bebas sesuai kebutuhan
//     message: `Can't find ${req.originalUrl} on this server!`,
//   });
// });
// app.use(globalErrorHandler);

// export default app;
//
// --- IGNORE ---

import express from "express";
import cors from 'cors';
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import globalErrorHandler from "./controllers/errorController.js";

const app = express();

app.use(cors()); // Enable CORS for all routes

// --- MIDDLEWARE DENGAN CCTV LENGKAP ---

app.use((req, res, next) => {
  console.log("--- 1. Request masuk aplikasi ---");
  next();
});

// Set Security HTTP Headers
app.use(helmet());
app.use((req, res, next) => {
  console.log("--- 2. Lewat Helmet ---");
  next();
});

// Batasi Request dari IP yang sama
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Terlalu banyak request dari IP ini. Coba lagi nanti ya.",
});
app.use("/api", limiter);
app.use((req, res, next) => {
  console.log("--- 3. Lewat Rate Limiter (jika path cocok /api) ---");
  next();
});

// Body Parser
app.use(express.json({ limit: "10kb" }));
app.use((req, res, next) => {
  console.log("--- 4. Lewat Body Parser (express.json) ---");
  next();
});

// Data Sanitization
// app.use(mongoSanitize());
app.use((req, res, next) => {
  console.log("--- 5. Lewat Mongo Sanitize ---");
  next();
});

// app.use(xss());
app.use((req, res, next) => {
  console.log("--- 6. Lewat XSS Clean ---");
  next();
});

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use((req, res, next) => {
  console.log("--- 7. Lewat Morgan (jika dev) ---");
  next();
});

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
