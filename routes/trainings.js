import express from "express";
import Training from "../models/Training.js";
import Employee from "../models/Employee.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware: Auth prüfen
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

// 🔹 GET alle Trainings
router.get("/", auth, async (req, res) => {
  try {
    const trainings = await Training.find().lean();
    res.json(trainings);
  } catch (err) {
    console.error("Fehler beim Laden:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// 🔹 POST neues Training
router.post("/", auth, async (req, res) => {
  try {
    const { titel, beschreibung, trainer, ort, zeitpunkt } = req.body;
    if (req.user.rank !== "Ausbilder" && req.user.rank !== "Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const training = new Training({
      titel,
      beschreibung,
      trainer,
      ort,
      zeitpunkt,
      erstelltVon: req.user.username,
    });

    await training.save();
    res.status(201).json(training);
  } catch (err) {
    console.error("Fehler beim Erstellen:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// 🔹 DELETE Training
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Ausbilder" && req.user.rank !== "Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    await Training.findByIdAndDelete(req.params.id);
    res.json({ message: "Training gelöscht" });
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

// 🔹 POST Teilnahme (Officer)
router.post("/:id/join", auth, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Nicht gefunden" });

    const bereitsDrin = training.teilnehmer.find(t => t.username === req.user.username);
    if (bereitsDrin)
      return res.status(400).json({ message: "Bereits angemeldet" });

    training.teilnehmer.push({
      username: req.user.username,
      name: req.user.name,
      bestanden: false,
    });

    await training.save();
    res.json({ message: "Teilnahme erfolgreich" });
  } catch (err) {
    console.error("Fehler bei Teilnahme:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// 🔹 Modul hinzufügen (nur Ausbilder & Chiefs)
router.post("/:id/module", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Ausbilder" && req.user.rank !== "Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const { titel, inhalt } = req.body;
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });

    training.module.push({ titel, inhalt });
    await training.save();
    res.json(training);
  } catch (err) {
    console.error("Fehler beim Modul hinzufügen:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// 🔹 Modul bearbeiten
router.put("/:trainingId/module/:moduleId", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Ausbilder" && req.user.rank !== "Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const { titel, inhalt } = req.body;
    const training = await Training.findById(req.params.trainingId);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });

    const modul = training.module.id(req.params.moduleId);
    if (!modul) return res.status(404).json({ message: "Modul nicht gefunden" });

    modul.titel = titel;
    modul.inhalt = inhalt;

    await training.save();
    res.json({ message: "Modul aktualisiert" });
  } catch (err) {
    console.error("Fehler beim Bearbeiten:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// 🔹 Modul löschen
router.delete("/:trainingId/module/:moduleId", auth, async (req, res) => {
  try {
    if (req.user.rank !== "Ausbilder" && req.user.rank !== "Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const training = await Training.findById(req.params.trainingId);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });

    training.module = training.module.filter(
      m => m._id.toString() !== req.params.moduleId
    );

    await training.save();
    res.json({ message: "Modul gelöscht" });
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

export default router;
