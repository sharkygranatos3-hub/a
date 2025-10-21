// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js"; // ✅ korrekt importieren

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Benutzername und Passwort erforderlich" });
  }

  try {
    // Benutzer suchen
    const user = await Employee.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Benutzer nicht gefunden" });

    // Passwort prüfen
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Ungültiges Passwort" });

    // Token erstellen
    const token = jwt.sign(
      {
        _id: user._id,
        name: `${user.firstname} ${user.lastname}`,
        username: user.username,
        rank: user.rank
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" } // optional: 8 Stunden
    );

    res.json({ token, rank: user.rank });
  } catch (err) {
    console.error("Login-Fehler:", err);
    res.status(500).json({ msg: "Serverfehler" });
  }
});

export default router;
