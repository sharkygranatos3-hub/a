import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB-Verbindung herstellen
console.log("🔍 Starte Verbindung zu MongoDB Atlas ...");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Mit MongoDB verbunden"))
.catch(err => console.error("❌ MongoDB Fehler:", err.message));

// Testroute
app.get("/", (req, res) => res.send("Backend läuft mit MongoDB!"));

// Beispielroute Mitarbeiter (Dummy bis Backend fertig ist)
app.get("/api/employees", (req, res) => {
  res.json([{ name: "Max Mustermann", rank: "Chief" }]);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));
