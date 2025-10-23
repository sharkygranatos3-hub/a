import express from "express";
import Training from "../models/Training.js";
import auth from "../middleware/auth.js"; // falls du ein Token-Middleware nutzt

const router = express.Router();

// 📍 Alle Trainings holen (sortiert nach sortOrder)
router.get("/", auth, async (req, res) => {
  try {
    const trainings = await Training.find().sort({ sortOrder: 1 });
    res.json(trainings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Trainings" });
  }
});

// 📍 Neues Training erstellen
router.post("/", auth, async (req, res) => {
  try {
    const { title, trainer, content, maxParticipants, sortOrder } = req.body;
    const newTraining = new Training({
      title,
      trainer,
      content,
      maxParticipants,
      sortOrder: sortOrder || 999
    });
    await newTraining.save();
    res.status(201).json(newTraining);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen der Ausbildung" });
  }
});

// 📍 Teilnahme anfragen
router.post("/:id/signup", auth, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Nicht gefunden" });

    // Prüfen ob bereits eingetragen
    const already = training.participants.find(p => p.userId === req.user.id);
    if (already) return res.status(400).json({ message: "Bereits angemeldet" });

    if (training.participants.length >= training.maxParticipants)
      return res.status(400).json({ message: "Maximale Teilnehmer erreicht" });

    training.participants.push({ name: req.user.name, userId: req.user.id });
    await training.save();
    res.json(training);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler bei Teilnahme" });
  }
});

// 📍 Training bearbeiten (Titel, Inhalt, SortOrder etc.)
router.put("/:id", auth, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Nicht gefunden" });

    const allowedFields = ["title", "trainer", "content", "maxParticipants", "sortOrder"];
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined) training[f] = req.body[f];
    });

    await training.save();
    res.json(training);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Bearbeiten" });
  }
});

// 📍 Teilnehmer entfernen (nur Chief/Ausbilder)
router.delete("/:id/participant/:userId", auth, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Nicht gefunden" });

    training.participants = training.participants.filter(p => p.userId !== req.params.userId);
    await training.save();
    res.json(training);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Entfernen des Teilnehmers" });
  }
});

// 📍 Ausbildung löschen
router.delete("/:id", auth, async (req, res) => {
  try {
    await Training.findByIdAndDelete(req.params.id);
    res.json({ message: "Erfolgreich gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

export default router;
