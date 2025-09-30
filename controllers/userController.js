// import User from "../models/userModel.js";

// export const getAllUsers = async (req, res, next) => {
//   console.log('--- 4. Masuk ke getAllUsers ---'); // Tambahin ini
//   console.log("Masuk getAllUsers controller");
//   const users = await User.find();
//   res.status(200).json({
//     status: "success",
//     data: users,
//   });
// };

// export const getUserById = async (req, res, next) => {
//   const user = await User.findById(req.params.id);
//   if (!user) {
//     return res.status(404).json({ message: "User tidak ditemukan!" });
//   }
//   res.status(200).json({ status: "success", data: user });
// };

// export const updateUser = async (req, res, next) => {
//   const user = await User.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });
//   if (!user) {
//     return res.status(404).json({ message: "User tidak ditemukan!" });
//   }
//   res.status(200).json({ status: "success", data: user });
// };

// export const deleteUser = async (req, res, next) => {
//   const user = await User.findByIdAndDelete(req.params.id);
//   if (!user) {
//     return res.status(404).json({ message: "User tidak ditemukan!" });
//   }
//   res.status(204).json({ status: "success", data: null });
// };
import User from "../models/userModel.js";

export const getAllUsers = async (req, res, next) => {
  //kasihh nilai default berapa banyak query yang di tampilan perhalaman
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  // 2. Hitung berapa data yang harus di-skip
  // Kalo page=1, skip=0. Kalo page=2, skip=10. Dst.
  const skip = (page - 1) * limit;
  // 3. Tambahin .skip() dan .limit() ke Mongoose query
  const users = await User.find().skip(skip).limit(limit);
  // (Opsional) Hitung total semua dokumen buat info tambahan
  const totalUser = await User.countDocuments();

  res.status(200).json({
    status: "success",
    results: users.length,
    currentPage: page,
    totalPages: Math.ceil(totalUser / limit), // <-- TAMBAHIN INI
    totalData: totalUser,
    data: { users },
  });
};

export const getUserById = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan!" });
  }
  res.status(200).json({ status: "success", data: { user } });
};

// controllers/userController.js

export const updateUser = async (req, res, next) => {
  // Otorisasi tetep sama
  if (req.user.role !== "admin" && req.user.id !== req.params.id) {
    return res
      .status(403)
      .json({ message: "Lo cuma boleh ngedit profil lo sendiri!" });
  }

  // 1. Ambil dulu dokumen user-nya dari DB
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan!" });
  }

  // 2. Update field yang diizinkan secara manual
  // Ini juga lebih aman biar user gak bisa update 'role' sembarangan
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;

  // 3. Kalo ada password baru, update juga
  // Mongoose bakal tau field 'password' dimodifikasi, jadi pre('save') bakal aktif
  if (req.body.password) {
    user.password = req.body.password;
  }

  // 4. Simpen perubahannya pake .save() biar sihir pre('save') jalan
  const updatedUser = await user.save();

  updatedUser.password = undefined; // Sembunyiin lagi dari respon

  res.status(200).json({ status: "success", data: { user: updatedUser } });
};

export const deleteUser = async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User tidak ditemukan!" });
  }
  res.status(204).json({ status: "success", data: null });
};
//ini buat update photo
// export const updateUserPhoto = async (req, res, next) => {
//   // Otorisasi tetep sama
//   if (req.user.role !== "admin" && req.user.id !== req.params.myPhoto) {
//     return res
//       .status(403)
//       .json({ message: "Lo cuma boleh ngedit profil lo sendiri!" });
//   }

//   // 1. Ambil dulu dokumen user-nya dari DB
//   const user = await User.findById(req.params.myPhoto);
//   if (!user) {
//     return res.status(404).json({ message: "User tidak ditemukan!" });
//   }

//   // 2. Update field photo
//   if (req.file) {
//     user.photo = req.file.filename; // Simpen nama file yang diupload
//   } else {
//     return res.status(400).json({ message: "Gagal upload foto!" });
//   }

//   // 3. Simpen perubahannya pake .save()
//   const updatedUser = await user.save();

//   updatedUser.password = undefined; // Sembunyiin lagi dari respon

//   res.status(200).json({ status: "success", data: { user: updatedUser } });
// };
// controllers/userController.js

// ... (controller lainnya)

export const updateUserPhoto = async (req, res, next) => {
  // Cek kalo Multer berhasil upload file
  if (!req.file) {
    return res.status(400).json({ message: 'Tolong upload sebuah file gambar.' });
  }

  // 1. Ambil nama file uniknya dari `req.file`
  const filename = req.file.filename;

  // 2. Update user yang lagi login pake `req.user.id` (INI YANG DIBENERIN)
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id, // <-- Pake ID dari user yang login, bukan dari req.params
    { photo: filename }, // Update field 'photo'
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
};