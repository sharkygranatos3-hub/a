import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import emailRoutes from "./routes/emails.js";
import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import investigationRoutes from "./routes/investigations.js";
import trainingRoutes from "./routes/trainings.js";
import newsRoutes from './routes/news.js';
import eventRoutes from "./routes/events.js";
import wikiRoutes from "./routes/wiki.js";

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
.then(() => console.log("✅ Mit MongoDB verbunden"))
.catch(err => console.error("❌ MongoDB Fehler:", err.message));

// 🔹 API-Routen
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/emails", emailRoutes); // ← neue Mail-Route eingebunden
app.use("/uploads", express.static(path.join(path.resolve(), "uploads")));
app.use("/api/investigations", investigationRoutes);
app.use("/api/trainings", trainingRoutes);
app.use('/api/news', newsRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/wiki", wikiRoutes);

// Test-Endpunkt
app.get("/", (req, res) => res.send("Backend läuft!"));

// Server starten
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));






