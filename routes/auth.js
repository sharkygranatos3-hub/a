// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const router = express.Router();

// User-Model explizit für "users" Collection
const UserSchema = new mongoose.Schema({
  vorname: String,
  nachname: String,
  username: String,
  password: String, // gehashed
  rang: String,
});

const User = mongoose.model("User", UserSchema, "users"); // ← 'users' Collection

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Benutzername und Passwort erforderlich" });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Benutzer nicht gefunden" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Ungültige Anmeldedaten" });

    // Token erstellen
    const token = jwt.sign(
      {
        _id: user._id,
        name: `${user.vorname} ${user.nachname}`,
        username: user.username,
        rank: user.rang,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, rank: user.rang });
  } catch (err) {
    console.error("Login-Fehler:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

export default router;
