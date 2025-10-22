import express from "express";
import jwt from "jsonwebtoken";
import TrainingContent from "../models/TrainingContent.js";

const router = express.Router();

// Auth Middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Kein Token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Ungültiger Token" });
  }
}

// 🔹 Alle Inhalte abrufen (Chief & Ausbilder)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Ausbilder" && req.user.rank !== "Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const contents = await TrainingContent.find().lean();
    res.json(contents);
  } catch (err) {
    console.error("Fehler beim Laden:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// 🔹 Neuen Ausbildungsinhalt erstellen
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Ausbilder" && req.user.rank !== "Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const { titel, beschreibung } = req.body;

    const newContent = new TrainingContent({
      titel,
      beschreibung,
      erstelltVon: req.user.username,
    });

    await newContent.save();
    res.status(201).json(newContent);
  } catch (err) {
    console.error("Fehler beim Erstellen:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// 🔹 Ausbildungsinhalt bearbeiten
router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Ausbilder" && req.user.rank !== "Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const updated = await TrainingContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error("Fehler beim Bearbeiten:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// 🔹 Ausbildungsinhalt löschen
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Ausbilder" && req.user.rank !== "Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    await TrainingContent.findByIdAndDelete(req.params.id);
    res.json({ message: "Inhalt gelöscht" });
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// 🔹 Modul zu Inhalt hinzufügen
router.post("/:id/module", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Ausbilder" && req.user.rank !== "Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const { titel, inhalt } = req.body;
    const content = await TrainingContent.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Nicht gefunden" });

    content.module.push({ titel, inhalt });
    await content.save();
    res.json(content);
  } catch (err) {
    console.error("Fehler beim Hinzufügen:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

export default router;
