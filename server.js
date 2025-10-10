// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

// ----------------- User Schema -----------------
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Officer" } // z.B. Chief, Co-Chief, Officer
});

const User = mongoose.model("User", userSchema);

// ----------------- Auth-Route -----------------
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if(!user) return res.status(401).json({ error: "Ungültige Anmeldedaten" });

    const valid = await bcrypt.compare(password, user.password);
    if(!valid) return res.status(401).json({ error: "Ungültige Anmeldedaten" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Serverfehler" });
  }
});

// ----------------- Beispielroute: Mitarbeiter -----------------
app.get("/api/employees", async (req, res) => {
  const employees = await User.find({}, { password: 0 }); // Passwort nicht zurückgeben
  res.json(employees);
});

// ----------------- Test-Route -----------------
app.get("/", (req, res) => res.send("Backend läuft mit MongoDB!"));

// ----------------- Server starten -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server läuft auf Port ${PORT}`));
