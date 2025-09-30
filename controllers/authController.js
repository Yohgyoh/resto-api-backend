// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import User from "../models/userModel.js";
// import catchAsync from "../utils/catchAsync.js";
import { validationResult } from "express-validator";

// // --- FUNGSI BANTUAN BUAT BIKIN TOKEN ---
// const signToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: "90d",
//   });
// };

// // --- LOGIC REGISTER ---
// export const register = catchAsync(async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     // Kalo ada error, langsung kirim balik laporannya
//     return res.status(400).json({ status: "fail", errors: errors.array() });
//   }
//   const newUser = await User.create({
//     name: req.body.name,
//     email: req.body.email,
//     password: req.body.password,
//   });
//   const token = signToken(newUser._id);
//   newUser.password = undefined;
//   res.status(201).json({
//     status: "success",
//     token,
//     data: { user: newUser },
//   });
// });

// // --- LOGIC LOGIN ---
// export const login = catchAsync(async (req, res, next) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res
//       .status(400)
//       .json({ message: "Tolong masukin email dan password!" });
//   }
//   const user = await User.findOne({ email }).select("+password");
//   const isCorrect = user
//     ? await bcrypt.compare(password, user.password)
//     : false;
//   if (!user || !isCorrect) {
//     return res.status(401).json({ message: "Email atau password salah!" });
//   }
//   const token = signToken(user._id);
//   res.status(200).json({ status: "success", token });
// });

// // --- MIDDLEWARE SATPAM (PROTECT) ---
// export const protect = catchAsync(async (req, res, next) => {
//   console.log("Masuk protect middleware");
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }
//   if (!token) {
//     console.log("Token tidak ditemukan");
//     return res
//       .status(401)
//       .json({ message: "Lo belum login! Silakan login dulu." });
//   }
//   const decoded = await jwt.verify(token, process.env.JWT_SECRET);
//   const currentUser = await User.findById(decoded.id);
//   if (!currentUser) {
//     console.log("User pemilik token tidak ditemukan");
//     return res
//       .status(401)
//       .json({ message: "User pemilik token ini udah gak ada." });
//   }
//   req.user = currentUser;
//   console.log("Protect selesai, lanjut ke next()");
//   next();
// });
// export const restrictTo = (...roles) => {
//   return (req, res, next) => {
//     console.log("--- 3. Masuk ke restrictTo ---"); // Tambahin ini
//     // `req.user` ini kita dapet dari middleware `protect` sebelumnya.
//     // Middleware ini ngecek: Jabatan si user (req.user.role) ada gak
//     // di dalam daftar jabatan yang diizinin (`roles`)?
//     if (!roles.includes(req.user.role)) {
//       //kalo user ga ada role tolak dngan forbidden
//       return res.status(403).json({
//         message: "lo ga punya izin untuk lakuin aksi ini",
//       });
//     }
//   };
// };
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/emailHandler.js";
import crypto from "crypto";

// --- FUNGSI BANTUAN BUAT BIKIN TOKEN ---
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "90d",
  });
};

export const register = catchAsync(async (req, res, next) => {
    console.log('--- 3. Request sampai di controller register ---');
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });
  const token = signToken(newUser._id);
  newUser.password = undefined;
  res.status(201).json({
    status: "success",
    token,
    data: { user: newUser },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Tolong masukin email dan password!" });
  }
  const user = await User.findOne({ email }).select("+password");
  const isCorrect = user
    ? await bcrypt.compare(password, user.password)
    : false;
  if (!user || !isCorrect) {
    return res.status(401).json({ message: "Email atau password salah!" });
  }
  const token = signToken(user._id);
  res.status(200).json({ status: "success", token });
});

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return res
      .status(401)
      .json({ message: "Lo belum login! Silakan login dulu." });
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res
      .status(401)
      .json({ message: "User pemilik token ini udah gak ada." });
  }
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Lo gak punya izin buat ngelakuin aksi ini!",
      });
    }
    next();
  };
};

// controllers/authController.js

export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Cari user berdasarkan email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Tetap balas sukses agar tidak bocor data email yang terdaftar
    return res.status(200).json({ status: 'success', message: 'Token terkirim ke email!' });
  }

  // 2. Bikin token reset password
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3. Kirim token itu ke email si user
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/resetPassword/${resetToken}`;

  const message = `Lupa password? Kirim PATCH request dengan password baru lo ke: ${resetURL}.\n\nLink ini cuma valid 10 menit. Kalo lo gak merasa minta reset, abaikan aja email ini ya!`;

  try {
    // --- BAGIAN YANG DIPERBAIKI ---
    await sendEmail({
      to: user.email,
      subject: 'Token Reset Password Akun Lo (berlaku 10 menit)',
      text: message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token terkirim ke email!',
    });
  } catch (err) {
    // Kalo email gagal dikirim, hapus token & expired-nya dari DB
     console.error('ERROR  nodemailer:', err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    // Lempar error ke global error handler biar developer tau
    return res.status(500).json({ message: 'Gagal ngirim email, coba lagi nanti.' });
  }
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
    
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Token gak valid atau udah kedaluwarsa" });
  }
  
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({ status: "success", token });
});