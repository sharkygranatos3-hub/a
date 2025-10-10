// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Environment Variablen laden
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------- MongoDB Verbindung -----------------
console.log("🔍 Starte Verbindung zu MongoDB Atlas ...");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Mit MongoDB verbunden"))
.catch(err => console.error("❌ MongoDB Fehler:", err.message));

// ----------------- Auth-Route -----------------
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  // Dummy-Login (später DB-Abfrage)
  if(username === "admin" && password === "12345") {
    const token = jwt.sign(
      { username }, 
      process.env.JWT_SECRET || "secret", 
      { expiresIn: "1h" }
    );
    return res.json({ token });
  }

  res.status(401).json({ error: "Ungültige Anmeldedaten" });
});

// ----------------- Beispiel-Mitarbeiter-Route -----------------
app.get("/api/employees", (req, res) => {
  res.json([
    { name: "Max Mustermann", rank: "Chief" },
    { name: "Erika Musterfrau", rank: "Officer" }
  ]);
});

// ----------------- Test-Route -----------------
app.get("/", (req, res) => res.send("Backend läuft mit MongoDB!"));

// ----------------- Server starten -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));
