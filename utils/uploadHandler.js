// utils/uploadHandler.js
import multer from "multer";

// --- 1. Atur 'Gudang' Penyimpanan (DiskStorage) ---
// Kita kasih tau Multer buat nyimpen filenya di disk (hard drive server)
const multerStorage = multer.diskStorage({
  // nentuin folder tujuan
  destination: (req, file, cb) => {
    // cb = callback function
    cb(null, "public/img/users"); // simpen di folder ini
  },
  // nentuin nama file biar unik
  filename: (req, file, cb) => {
    // ambil ekstensi filenya (jpg, png, dll)
    const ext = file.mimetype.split("/")[1];
    // bikin nama unik: user-(id user)-(timestamp).ekstensi
    const uniqueFilename = `user-${req.user.id}-${Date.now()}.${ext}`;
    cb(null, uniqueFilename);
  },
});

// --- 2. Bikin 'Filter' buat nge-scan file ---
// Kita kasih aturan file apa aja yang boleh di-upload
const multerFilter = (req, file, cb) => {
  // Cek kalo tipe filenya diawali dengan 'image' (image/jpeg, image/png)
  if (file.mimetype.startsWith("image")) {
    cb(null, true); // Lolos, karena ini gambar
  } else {
    // Kalo bukan gambar, kita kasih error
    const err = new Error("Bukan gambar! Tolong upload gambar saja.");
    err.statusCode = 400; // Kasih status code biar jelas
    cb(err, false); // Gagal
  }
};

// --- 3. Gabungin jadi satu 'Petugas Kargo' ---
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export default upload; // Export 'petugas' yang udah siap kerja
