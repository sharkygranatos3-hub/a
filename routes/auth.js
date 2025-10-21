// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Benutzername und Passwort erforderlich." });
    }

    // Benutzer suchen
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Benutzer nicht gefunden." });
    }

    // Passwort prüfen
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Ungültiges Passwort." });
    }

    // Token erstellen
    const token = jwt.sign(
      {
        _id: user._id,
        name: `${user.vorname} ${user.nachname}`,
        username: user.username,
        rank: user.rang
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Erfolg
    res.json({ token, rank: user.rang, message: "Login erfolgreich." });

  } catch (err) {
    console.error("Fehler im Login:", err);
    res.status(500).json({ message: "Serverfehler beim Login." });
  }
});

export default router;
