// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js"; // 🟢 dein existierendes Model

const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Benutzername und Passwort erforderlich" });

  try {
    // Employee-Model auf die Collection "users" zwingen
    const user = await Employee.findOne({ username }).exec();
    if (!user) return res.status(400).json({ message: "Benutzer nicht gefunden" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Ungültige Anmeldedaten" });

    // Token erstellen
    const token = jwt.sign(
      {
        _id: user._id,
        name: `${user.firstname} ${user.lastname}`,
        username: user.username,
        rank: user.rank,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, rank: user.rank });
  } catch (err) {
    console.error("Login-Fehler:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

export default router;
