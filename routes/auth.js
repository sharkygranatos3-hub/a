import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";

const router = express.Router();

// 🔹 Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: "Benutzername und Passwort erforderlich" });

  try {
    // Benutzer in der "users"-Collection finden
    const user = await Employee.findOne({ username }).exec();
    if (!user) return res.status(400).json({ message: "Benutzer nicht gefunden" });

    // Passwort prüfen
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Ungültige Anmeldedaten" });
    
    // JWT Token erstellen
console.log("User beim Login:", user); // schon gemacht
let vorname, nachname, username, rang, _id;
if (user._doc) {
  ({ vorname, nachname, username, rang, _id } = user._doc);
} else {
  ({ vorname, nachname, username, rang, _id } = user);
}

const token = jwt.sign(
  {
    _id,
    name: `${vorname} ${nachname}`,
    username,
    rank: rang,
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
