import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

// 🔒 Middleware Authentifizierung
const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Kein Token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token ungültig" });
  }
};

// 🧾 Alle Mitarbeiter abrufen
router.get("/", auth, async (req, res) => {
  try {
    const employees = await User.find({}, "-password");
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Mitarbeiter" });
  }
});

// 👤 Einzelnen Mitarbeiter abrufen
router.get("/:id", auth, async (req, res) => {
  try {
    const emp = await User.findById(req.params.id, "-password");
    if (!emp) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Abrufen" });
  }
});

// ➕ Mitarbeiter erstellen (nur Chief / Co-Chief)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Chief" && req.user.rank !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const { vorname, nachname, username, password, rang, dienstnummer } = req.body;
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: "Benutzername existiert bereits" });

    const newUser = new User({
      vorname,
      nachname,
      username,
      password,
      rang,
      dienstnummer,
      entries: [],
    });

    await newUser.save();
    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen" });
  }
});

// ✏️ Mitarbeiter bearbeiten (nur Chief / Co-Chief)
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Chief" && req.user.rank !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Nicht gefunden" });

    Object.assign(emp, req.body);
    await emp.save();
    res.json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Bearbeiten" });
  }
});

// ❌ Mitarbeiter löschen (nur Chief / Co-Chief)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Chief" && req.user.rank !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Mitarbeiter gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

// 🟩 Eintrag hinzufügen
router.post("/:id/entries", auth, async (req, res) => {
  try {
    const { type, text, date } = req.body;
    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });

    if (!emp.entries) emp.entries = [];
    emp.entries.push({ type, text, date: date || new Date() });

    await emp.save();
    res.json(emp.entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Hinzufügen eines Eintrags" });
  }
});

// 🔑 Passwort ändern oder neu generieren
router.put("/:id/password", auth, async (req, res) => {
  try {
    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });

    // Nur Chief/Co-Chief dürfen für andere neu setzen
    // Normale Nutzer nur für sich selbst
    if (req.user.id !== emp._id.toString() && req.user.rank !== "Chief" && req.user.rank !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: "Neues Passwort erforderlich" });

    emp.password = newPassword;
    await emp.save();
    res.json({ message: "Passwort erfolgreich geändert" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Ändern des Passworts" });
  }
});

export default router;
