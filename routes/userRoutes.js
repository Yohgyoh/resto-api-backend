// import express from "express";
// import { body } from "express-validator";

// // Import controller yang relevan
// import {
//   getAllUsers,
//   getUserById,
//   updateUser,
//   deleteUser,
// } from "../controllers/userController.js";

// // Import Satpam
// import { protect, restricTo } from "../controllers/authController.js";

// // Import pembungkus error
// import catchAsync from "../utils/catchAsync.js";

// const router = express.Router();

// // --- PASANG SATPAM DI SINI ---
// // Semua rute di bawah baris ini sekarang WAJIB LOGIN

// router.use(protect);

// // Rute buat dapetin semua user & by ID
// router.get("/", restricTo("admin"), catchAsync(getAllUsers));
// router.delete("/:id", restricTo("admin"), catchAsync(deleteUser));

// // Rute buat update & hapus data
// router.get("/:id", catchAsync(getUserById));
// router.patch("/:id", catchAsync(updateUser));

// // CATATAN: Rute POST (Create User) dipindah ke /register di authRoutes

// export default router;
// routes/userRoutes.js
import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserPhoto,
} from "../controllers/userController.js";
import { protect, restrictTo } from "../controllers/authController.js";
import catchAsync from "../utils/catchAsync.js";
import upload from "../utils/uploadHandler.js";

const router = express.Router();

router.use(protect);

router.get("/", restrictTo("admin"), catchAsync(getAllUsers));
router.delete("/:id", restrictTo("admin"), catchAsync(deleteUser));
router.get("/:id", catchAsync(getUserById));
router.patch("/update-my-photo", upload.single("photo"), catchAsync(updateUserPhoto));
router.patch("/:id", catchAsync(updateUser));

export default router;
