import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Login (vorerst Klartext-Passwort)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if(!username || !password)
      return res.status(400).json({ message: "Benutzername und Passwort erforderlich" });

    const user = await User.findOne({ username });
    if(!user) return res.status(401).json({ message: "Ungültiger Benutzername oder Passwort" });
    if(!user.active) return res.status(403).json({ message: "Benutzerkonto gesperrt" });

    if(user.password !== password) // Klartext
      return res.status(401).json({ message: "Ungültiger Benutzername oder Passwort" });

    const token = jwt.sign(
      { id: user._id, username: user.username, rank: user.rang },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, rank: user.rang });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

export default router;
