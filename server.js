// server.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";

import app from "./app.js";

dotenv.config();

const port = process.env.PORT || 8000; // Pastiin port-nya bener
const MONGO_URI = process.env.MONGO_URI; // Pake nama variabel lo

// Bikin server HTTP gabungan
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Listener Socket.IO
io.on("connection", (socket) => {
  console.log("Satu client baru nyambung! ID-nya:", socket.id);

  socket.on("chat message", (msg) => {
    console.log("Pesan diterima:", msg);
    io.emit("chat message", msg); // Kirim ke SEMUA client
  });
  
  socket.on("disconnect", () => {
    console.log("Client dengan ID:", socket.id, "putus koneksi.");
  });
});

// Proses:
// 1. Sambungin dulu ke Database
// 2. KALO BERHASIL, baru jalanin server Express + Socket.IO
mongoose
  .connect(MONGO_URI) // <-- Pake MONGO_URI
  .then(() => {
    console.log("Koneksi ke MongoDB Atlas BERHASIL! 🚀");
    // Nyalain httpServer, BUKAN app
    httpServer.listen(port, "0.0.0.0", () => {
      console.log(`App (plus Socket.IO) dengerin di http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Koneksi ke MongoDB GAGAL! 😭", err);
    process.exit(1);
  });
  
