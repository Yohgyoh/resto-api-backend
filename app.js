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
  origin: [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:5173",
    "http://localhost:5174",
    "https://jakarta-cafe-api-backend.onrender.com",
    "*" // Fallback untuk development
  ],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin", 
    "X-Requested-With", 
    "Content-Type", 
    "Accept", 
    "Authorization",
    "Cache-Control",
    "Pragma"
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Manual CORS headers as backup (untuk memastikan headers selalu ada)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 2. Keamanan Lainnya
// Temporarily disable helmet to fix CORS issue
// app.use(helmet({
//   crossOriginEmbedderPolicy: false,
//   crossOriginResourcePolicy: false,
//   crossOriginOpenerPolicy: false,
// })); // Set HTTP headers yang aman

// CORS headers AFTER helmet to ensure they're not overridden
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

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

// Explicitly handle OPTIONS requests for auth endpoints
app.options('/api/auth/login', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

app.options('/api/auth/register', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.status(200).end();
});

// Test endpoint to verify CORS
app.get('/api/test-cors', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.json({
    message: 'CORS test endpoint',
    headers: req.headers,
    cors: 'working'
  });
});

app.options('/api/test-cors', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// --- ERROR HANDLING (WAJIB PALING BAWAH) ---

// Handler untuk rute yang gak ada (404 Not Found)
app.use((req, res, next) => {
  // Force CORS headers even on 404
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// "UGD" buat semua error yang terjadi di aplikasi
app.use(globalErrorHandler);

export default app;
