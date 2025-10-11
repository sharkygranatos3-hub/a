import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB verbinden
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("✅ Mit MongoDB verbunden"))
.catch(err => console.error("❌ MongoDB Fehler:", err.message));

// Routen
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);

// Test-Endpunkt
app.get("/", (req, res) => res.send("Backend läuft!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));
