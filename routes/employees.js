import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware Auth
const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if(!token) return res.status(401).json({ message: "Kein Token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(err) {
    res.status(401).json({ message: "Token ungültig" });
  }
};

// Alle Mitarbeiter abrufen
router.get("/", auth, async (req,res) => {
  try {
    const employees = await User.find({}, "-password");
    res.json(employees);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Mitarbeiter" });
  }
});

// Mitarbeiter erstellen (nur Chief/Co-Chief)
router.post("/", auth, async (req,res) => {
  try {
    if(req.user.rank !== "Chief" && req.user.rank !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const { vorname, nachname, username, password, rang, dienstnummer } = req.body;
    const newUser = new User({ vorname, nachname, username, password, rang, dienstnummer, entries: [] });
    await newUser.save();
    res.json(newUser);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen" });
  }
});

// Bearbeiten
router.put("/:id", auth, async (req,res) => {
  try {
    if(req.user.rank !== "Chief" && req.user.rank !== "Co-Chief" && req.user.id !== req.params.id)
      return res.status(403).json({ message: "Keine Berechtigung" });

    const emp = await User.findById(req.params.id);
    if(!emp) return res.status(404).json({ message: "Nicht gefunden" });

    Object.assign(emp, req.body);
    await emp.save();
    res.json(emp);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Bearbeiten" });
  }
});

// Löschen
router.delete("/:id", auth, async (req,res) => {
  try {
    if(req.user.rank !== "Chief" && req.user.rank !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Gelöscht" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

////////////////////
// Einträge API
////////////////////

// Einträge abrufen
router.get("/:id/entries", auth, async (req,res) => {
  try {
    const emp = await User.findById(req.params.id, "entries");
    if(!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });
    res.json(emp.entries);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Einträge" });
  }
});

// Eintrag erstellen
router.post("/:id/entries", auth, async (req,res) => {
  try {
    const emp = await User.findById(req.params.id);
    if(!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });

    const newEntry = {
      type: req.body.type,
      description: req.body.description,
      date: new Date(),
      author: req.user.username,
      authorId: req.user.id
    };
    emp.entries.push(newEntry);
    await emp.save();
    res.json(newEntry);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen des Eintrags" });
  }
});

// Eintrag bearbeiten
router.put("/:id/entries/:entryId", auth, async (req,res) => {
  try {
    const emp = await User.findById(req.params.id);
    if(!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });

    const entry = emp.entries.id(req.params.entryId);
    if(!entry) return res.status(404).json({ message: "Eintrag nicht gefunden" });

    // Rechte prüfen
    if(req.user.rank !== "Chief" && req.user.rank !== "Co-Chief" && entry.authorId !== req.user.id)
      return res.status(403).json({ message: "Keine Berechtigung" });

    entry.description = req.body.description;
    await emp.save();
    res.json(entry);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Bearbeiten des Eintrags" });
  }
});

// Eintrag löschen
router.delete("/:id/entries/:entryId", auth, async (req,res) => {
  try {
    const emp = await User.findById(req.params.id);
    if(!emp) return res.status(404).json({ message: "Mitarbeiter nicht gefunden" });

    const entry = emp.entries.id(req.params.entryId);
    if(!entry) return res.status(404).json({ message: "Eintrag nicht gefunden" });

    // Rechte prüfen
    if(req.user.rank !== "Chief" && req.user.rank !== "Co-Chief" && entry.authorId !== req.user.id)
      return res.status(403).json({ message: "Keine Berechtigung" });

    entry.remove();
    await emp.save();
    res.json({ message: "Eintrag gelöscht" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen des Eintrags" });
  }
});

export default router;
