// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js"; // dein User/Employee Model

const router = express.Router();

// ----------------------------
// Login
// ----------------------------
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

    // Destructuring der User-Daten
    let vorname, nachname, rang, _id;
    if (user._doc) {
      ({ vorname, nachname, rang, _id } = user._doc);
    } else {
      ({ vorname, nachname, rang, _id } = user);
    }

    // JWT Token erstellen
    const token = jwt.sign(
      {
        _id,
        name: `${vorname} ${nachname}`, // jetzt korrekt
        username, // aus req.body
        rank: rang,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, rank: rang });
  } catch (err) {
    console.error("Login-Fehler:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// ----------------------------
// Optional: Registrierung (falls gebraucht)
// ----------------------------
router.post("/register", async (req, res) => {
  const { vorname, nachname, username, password, rang } = req.body;

  if (!vorname || !nachname || !username || !password)
    return res.status(400).json({ message: "Alle Felder erforderlich" });

  try {
    const exists = await Employee.findOne({ username });
    if (exists) return res.status(400).json({ message: "Benutzername existiert bereits" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Employee({
      vorname,
      nachname,
      username,
      password: hashedPassword,
      rang,
    });

    await newUser.save();
    res.json({ message: "Benutzer erfolgreich registriert" });
  } catch (err) {
    console.error("Registrierungsfehler:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

export default router;
