import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import Employee from "./models/Employee.js";

import emailRoutes from "./routes/emails.js";
import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import investigationRoutes from "./routes/investigations.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🧩 Uploads-Ordner bereitstellen (für Anhänge)
const __dirname = path.resolve();
const uploadsPath = path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsPath));

// 🔹 MongoDB verbinden
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log("✅ Mit MongoDB verbunden");

  // 🔹 Klartext-Passwörter hashen
  try {
    const users = await Employee.find({});
    for (const user of users) {
      if (!user.password.startsWith("$2")) { // bcrypt-Hashes beginnen mit $2
        const hashed = await bcrypt.hash(user.password, 10);
        user.password = hashed;
        await user.save();
        console.log(`✅ Passwort gehasht für ${user.username}`);
      }
    }
    console.log("🎉 Alle Klartext-Passwörter wurden gehasht!");
  } catch (err) {
    console.error("❌ Fehler beim Hashen der Passwörter:", err);
  }

})
.catch(err => console.error("❌ MongoDB Fehler:", err.message));

// 🔹 API-Routen
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/emails", emailRoutes);
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use("/api/investigations", investigationRoutes);

// Test-Endpunkt
app.get("/", (req, res) => res.send("Backend läuft!"));

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));
