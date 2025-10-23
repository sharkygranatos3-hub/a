import express from "express";
import Training from "../models/Training.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Alle Ausbildungen laden
router.get("/", authMiddleware, async (req, res) => {
  try {
    const trainings = await Training.find().sort({ sortOrder: 1 });
    res.json(trainings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Ausbildungen" });
  }
});

// Einzelne Ausbildung abrufen (für Editieren)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(training);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Ausbildung" });
  }
});

// Neue Ausbildung erstellen
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, trainer, maxParticipants, content, sortOrder } = req.body;
    const newTraining = new Training({
      title,
      trainer,
      maxParticipants,
      content,
      sortOrder,
      participants: []
    });
    await newTraining.save();
    res.status(201).json(newTraining);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen" });
  }
});

// Ausbildung aktualisieren
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Training.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Aktualisieren" });
  }
});

// Ausbildung löschen
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Training.findByIdAndDelete(req.params.id);
    res.json({ message: "Ausbildung gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

// Teilnahme anfragen
router.post("/:id/signup", authMiddleware, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Nicht gefunden" });

    const userId = req.user.id;
    const username = req.user.name;

    if (training.participants.some(p => p.id === userId))
      return res.status(400).json({ message: "Bereits angemeldet" });

    if (training.maxParticipants && training.participants.length >= training.maxParticipants)
      return res.status(400).json({ message: "Limit erreicht" });

    training.participants.push({ id: userId, name: username });
    await training.save();

    res.json({ message: "Teilnahme erfolgreich" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler bei Teilnahme" });
  }
});

// Teilnehmer zurücksetzen
router.post("/:id/resetParticipants", authMiddleware, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Nicht gefunden" });

    training.participants = [];
    await training.save();
    res.json({ message: "Teilnehmerliste geleert" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Zurücksetzen der Teilnehmer" });
  }
});

export default router;
