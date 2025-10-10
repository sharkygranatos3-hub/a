// ======================
//  LSPD Backend Server
// ======================

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

// Test-Endpunkt
app.get("/", (req, res) => res.send("Backend läuft mit MongoDB!"));

// Mitarbeiter-Routen
app.use("/api/employees", employeeRoutes);

// Login-Route
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  // Dummy-Login bis Backend fertig
  if(username === "admin" && password === "12345"){
    const token = jwt.sign({ username }, process.env.JWT_SECRET || "dummysecret", { expiresIn: "1h" });
    return res.json({ token });
  }
  return res.status(401).json({ error: "Ungültige Anmeldedaten" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));

