// ======================
//  LSPD Backend Server
// ======================

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS konfigurieren (Frontend darf zugreifen)
app.use(
  cors({
    origin: "*", // Später kannst du hier z. B. deine Domain eintragen
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ MongoDB-Verbindung herstellen
console.log("🔍 Starte Verbindung zu MongoDB Atlas ...");
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Mit MongoDB verbunden"))
  .catch((err) => console.error("❌ MongoDB Fehler:", err.message));

// ======================
//  Beispielrouten
// ======================

// Test-Endpunkt
app.get("/", (req, res) => res.send("Backend läuft mit MongoDB!"));

// Dummy-Mitarbeiterroute
app.get("/api/employees", (req, res) => {
  res.json([{ name: "Max Mustermann", rank: "Chief" }]);
});

// 🔐 Login-Route (Platzhalter, bis DB-Login fertig ist)
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  // Temporärer Login-Test
  if (username === "admin" && password === "12345") {
    return res.json({
      token: "dummy-token-admin",
      role: "Chief",
      message: "Login erfolgreich",
    });
  } else {
    return res.status(401).json({ error: "Ungültige Anmeldedaten" });
  }
});

// ======================
//  Server starten
// ======================
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));
