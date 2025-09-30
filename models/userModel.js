import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
// Bikin Schema (cetakan) untuk user
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nama user jangan kosong dong!"],
    },
    email: {
      type: String,
      required: [true, "Email jangan kosong!"],
      unique: true,
      lowercase: true,
    },
   
    password: {
      type: String,
      required: [true, "password jangan kosong"],
      minLength: 10,
      select: false,
    },
    passwordChangedAt: Date, // <-- BENER! Dia sejajar sama password, name, dll.
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    passwordResetToken: String,
    passwordResetExpires: Date, // perbaiki typo
  },
  {
    timestamps: true,
  }
);



// userSchema.pre("save", async function (next) {
//   // Cuma jalanin kalo password dimodif, dan BUKAN dokumen baru
//   if (!this.isModified("password") || this.isNew) return next();

//   // Set waktu ganti password sedikit ke belakang (1 detik)
//   this.passwordChangedAt = Date.now() - 1000;
//   next();
// });

// NOTE: Lo punya DUA pre-save hook di kode yg lo kirim, satu buat hash, satu lagi ini.
// Seharusnya digabung. Tapi karena hash password cuma jalan kalo isModified('password'),
// kita cukup pasang yang ini, karena yang hash udah ada di atasnya.
// Pastiin hook buat hash password juga ada dan bener.

// Versi gabungan yang paling bener:
userSchema.pre("save", async function (next) {
  // Cuma jalanin kalo password dimodif
  if (!this.isModified("password")) return next();

  // Hash password-nya
  this.password = await bcrypt.hash(this.password, 12);

  // Set passwordChangedAt, TAPI JANGAN pas bikin user baru
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }

  next();
});

// --- INSTANCE METHODS ---
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
// Tambahkan method untuk generate reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 menit
  return resetToken;
};

// Bikin Model dari Schema, kasih nama 'User'
const User = mongoose.model("User", userSchema);

export default User;

// // models/userModel.js
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import crypto from 'crypto';

// const userSchema = new mongoose.Schema(
//   {
//     // ... (isi skema lo, name, email, dll. biarin apa adanya)
//     name: { type: String, required: [true, 'Nama user jangan kosong dong!'] },
//     email: { type: String, required: [true, 'Email jangan kosong!'], unique: true, lowercase: true },
//     password: { type: String, required: [true, 'Password jangan kosong!'], minlength: 8, select: false },
//     passwordChangedAt: Date,
//     role: { type: String, enum: ['user', 'admin'], default: 'user' },
//     photo: { type: String, default: 'default.jpg' },
//     passwordResetToken: String,
//     passwordResetExpires: Date,
//   },
//   { timestamps: true }
// );

// // --- HANYA ADA SATU MIDDLEWARE PRE-SAVE DENGAN CCTV ---
// // userSchema.pre('save', async function (next) {
// //   console.log('--- A. Masuk ke pre-save hook ---');

// //   // Cuma jalanin kalo password dimodifikasi (atau baru)
// //   if (!this.isModified('password')) {
// //     console.log('--- B. Password tidak dimodifikasi, lanjut... ---');
// //     return next();
// //   }

// //   try {
// //     console.log('--- C. Mulai hashing password ---');
// //     // Hash password-nya
// //     this.password = await bcrypt.hash(this.password, 12);
// //     console.log('--- D. Selesai hashing password ---');

// //     // Set passwordChangedAt, TAPI JANGAN pas bikin user baru
// //     if (!this.isNew) {
// //       console.log('--- E. User lama, set passwordChangedAt ---');
// //       this.passwordChangedAt = Date.now() - 1000;
// //     }
    
// //     console.log('--- F. Memanggil next() untuk menyimpan ---');
// //     // Lanjut ke proses simpen
// //     next();
// //   } catch (error) {
// //     console.error('--- G. ERROR di dalam pre-save hook! ---', error);
// //     next(error); // Lempar error ke global error handler
// //   }
// // });


// // --- INSTANCE METHODS ---
// // ... (sisa file lo, biarin apa adanya)
// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) { /* ... */ };
// userSchema.methods.createPasswordResetToken = function () { /* ... */ };


// const User = mongoose.model('User', userSchema);
// export default User;