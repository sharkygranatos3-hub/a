// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// ----------------------------
// Login
// ----------------------------
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Benutzer finden
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "Benutzer nicht gefunden" });

    // Passwort prüfen
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Ungültiges Passwort" });

    // Token erstellen – jetzt inkl. _id, Name und Username
    const token = jwt.sign(
      { 
        _id: user._id,
        name: `${user.vorname} ${user.nachname}`,
        username: user.username,
        rank: user.rang // optional, falls du Rank speichern willst
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Token 1 Tag gültig
    );

    res.json({ token, rank: user.rang });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Serverfehler" });
  }
});

export default router;
