import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = express.Router();

// Middleware Auth
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

//////////////////////////
// Aktuellen User abrufen
//////////////////////////
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "-password");
    if (!user) return res.status(404).json({ message: "Nutzer nicht gefunden" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden des Benutzers" });
  }
});

//////////////////////////
// Alle Mitarbeiter abrufen
//////////////////////////
router.get("/", auth, async (req, res) => {
  try {
    const employees = await User.find({}, "-password");
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Mitarbeiter" });
  }
});

//////////////////////////
// Einzelnen Mitarbeiter abrufen
//////////////////////////
router.get("/:id", auth, async (req, res) => {
  try {
    const emp = await User.findById(req.params.id, "-password");
    if (!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });
    res.json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden des Mitarbeiters" });
  }
});

//////////////////////////
// Mitarbeiter erstellen (Chief / Co-Chief)
//////////////////////////
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.rang !== "Chief" && req.user.rang !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const { vorname, nachname, username, password, rang, dienstnummer } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      vorname,
      nachname,
      username,
      password: hashedPassword,
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

//////////////////////////
// Mitarbeiter bearbeiten
//////////////////////////
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.rang !== "Chief" && req.user.rang !== "Co-Chief" && req.user.id !== req.params.id)
      return res.status(403).json({ message: "Keine Berechtigung" });

    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Nicht gefunden" });

    const { vorname, nachname, rang } = req.body;

    if (vorname) emp.vorname = vorname;
    if (nachname) emp.nachname = nachname;
    if (rang && (req.user.rang === "Chief" || req.user.rang === "Co-Chief"))
      emp.rang = rang;

    await emp.save();
    res.json(emp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Bearbeiten" });
  }
});

//////////////////////////
// Mitarbeiter löschen
//////////////////////////
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.rang !== "Chief" && req.user.rang !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Mitarbeiter gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

//////////////////////////
// Passwort ändern (nur eigener Account)
//////////////////////////
router.put("/:id/password", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: "Nur eigener Account darf geändert werden" });

    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    emp.password = hashedPassword;
    await emp.save();

    res.json({ message: "Passwort geändert" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Passwort ändern" });
  }
});

//////////////////////////
// Passwort zurücksetzen (Chief / Co-Chief)
//////////////////////////
router.put("/:id/reset-password", auth, async (req, res) => {
  try {
    if (req.user.rang !== "Chief" && req.user.rang !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });

    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    emp.password = hashedPassword;
    await emp.save();

    res.json({ message: "Passwort zurückgesetzt", newPassword });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Zurücksetzen" });
  }
});

//////////////////////////
// Einträge (CRUD)
//////////////////////////
router.get("/:id/entries", auth, async (req, res) => {
  try {
    const emp = await User.findById(req.params.id, "entries");
    if (!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });
    res.json(emp.entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Einträge" });
  }
});

router.post("/:id/entries", auth, async (req, res) => {
  try {
    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });

    const newEntry = {
      type: req.body.type,
      text: req.body.text,
      date: new Date(),
      author: req.user.username,
      authorId: req.user.id,
    };

    emp.entries.push(newEntry);
    await emp.save();
    res.json(newEntry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen des Eintrags" });
  }
});

router.delete("/:id/entries/:entryId", auth, async (req, res) => {
  try {
    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });

    const entry = emp.entries.id(req.params.entryId);
    if (!entry) return res.status(404).json({ message: "Eintrag nicht gefunden" });

    if (req.user.rang !== "Chief" && req.user.rang !== "Co-Chief" && entry.authorId !== req.user.id)
      return res.status(403).json({ message: "Keine Berechtigung" });

    entry.remove();
    await emp.save();
    res.json({ message: "Eintrag gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen des Eintrags" });
  }
});

export default router;
