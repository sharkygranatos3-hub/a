import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// 🔹 MongoDB-Verbindung
console.log("🔍 Starte Verbindung zu MongoDB Atlas ...");
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Mit MongoDB verbunden"))
  .catch((err) => console.error("❌ MongoDB Fehler:", err.message));

// 🔹 Testroute
app.get("/", (req, res) => {
  res.send("Backend läuft mit MongoDB & Login!");
});

// 🔹 LOGIN-ENDPUNKT
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;

  // 🧠 Dummy-Testbenutzer (später kommt hier DB-Abfrage)
  if (username === "admin" && password === "12345") {
    return res.json({
      token: "dummy-token-admin",
      rank: "Chief",
      username: "admin",
    });
  }

  return res.status(401).json({ message: "Ungültige Anmeldedaten." });
});

// 🔹 Beispiel-Route Mitarbeiter
app.get("/api/employees", (req, res) => {
  res.json([{ name: "Max Mustermann", rank: "Chief" }]);
});

// Auth-Routen
app.use("/api/auth", authRoutes);

// 🔹 Serverstart
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));

