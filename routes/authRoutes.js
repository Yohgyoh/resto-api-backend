// // routes/authRoutes.js
// import express from 'express';
// import { register, login } from '../controllers/authController.js';

// const router = express.Router();

// // Rute ini GAK PERLU satpam, karena ini gerbang masuknya
// router.post('/register', register);
// router.post('/login', login);

// export default router;
import express from "express";
import { register, login, forgotPassword, resetPassword } from "../controllers/authController.js";

const router = express.Router();
// CCTV #2: Cek apakah request berhasil masuk ke router ini
router.use((req, res, next) => {
  console.log('--- 2. Request masuk ke authRoutes ---');
  next();
});

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);
export default router;
