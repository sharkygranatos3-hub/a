// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// MongoDB-Verbindung
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Mit MongoDB verbunden"))
.catch(err => console.error("❌ MongoDB Fehler:", err.message));

// 🔹 Login-Route hinzufügen
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  // Dummy-Login (später DB-Abfrage)
  if (username === "admin" && password === "12345") {
    return res.json({
      token: "dummy-token-admin",
      rank: "Chief",
      username: "admin"
    });
  }

  return res.status(401).json({ message: "Ungültige Anmeldedaten." });
});

// Testroute
app.get("/", (req, res) => res.send("Backend läuft mit MongoDB!"));

// Beispielroute Mitarbeiter
app.get("/api/employees", (req, res) => {
  res.json([{ name: "Max Mustermann", rank: "Chief" }]);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));
