// server.js

import app from "./app.js"; // <-- Import mesinnya
import { config } from "dotenv";
import mongoose from "mongoose";

config(); // Jalanin dotenv

const port = process.env.PORT || 3000;

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Koneksi ke MongoDB Atlas BERHASIL! 🚀");
  } catch (error) {
    console.error("Koneksi ke MongoDB GAGAL! 😭", error);
  }
};

if (process.env.NODE_ENV !== "test") {
  dbConnect();
}

app.listen(port, () => {
  console.log(`App dengerin di http://localhost:${port}`);
});


// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import app from './app.js';

// dotenv.config();

// const port = process.env.PORT || 8000;
// const DATABASE_URL = process.env.DATABASE_URL;

// mongoose
//   .connect(DATABASE_URL)
//   .then(() => {
//     console.log('Koneksi ke MongoDB Atlas BERHASIL! 🚀');
//     app.listen(port, () => {
//       console.log(`App dengerin di http://localhost:${port}`);
//     });
//   })
//   .catch((err) => {
//     console.error('Koneksi ke MongoDB GAGAL! 😭', err);
//     process.exit(1);
//   });