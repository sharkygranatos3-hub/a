import express from "express";
import Training from "../models/Training.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// 🔹 Alle Trainings abrufen
router.get("/", verifyToken, async (req, res) => {
  try {
    const trainings = await Training.find().sort({ createdAt: -1 });
    res.json(trainings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Trainings" });
  }
});

// 🔹 Einzelnes Training abrufen (mit Modulen)
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });
    res.json(training);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Abrufen" });
  }
});

// 🔹 Neues Training / Ausbildung anlegen
router.post("/", verifyToken, async (req, res) => {
  try {
    const { titel, beschreibung, trainer, ort, zeitpunkt } = req.body;
    if (!titel) return res.status(400).json({ message: "Titel erforderlich" });

    const newTraining = new Training({
      titel,
      beschreibung,
      trainer: trainer || `${req.user.name}`,
      ort,
      zeitpunkt,
      createdBy: req.user._id
    });

    await newTraining.save();
    res.json({ message: "Training erfolgreich erstellt", training: newTraining });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen" });
  }
});

// 🔹 Training bearbeiten
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updated = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Training nicht gefunden" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Aktualisieren" });
  }
});

// 🔹 Training löschen
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Training.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Training nicht gefunden" });
    res.json({ message: "Training gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

// 🔹 Teilnehmer anmelden
router.post("/:id/join", verifyToken, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });

    const already = training.teilnehmer.find(t => t.id.toString() === req.user._id);
    if (already) return res.status(400).json({ message: "Bereits angemeldet" });

    training.teilnehmer.push({ id: req.user._id, name: req.user.name });
    await training.save();

    res.json({ message: "Anmeldung erfolgreich" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler bei Anmeldung" });
  }
});

// 🔹 Teilnehmer als bestanden markieren
router.put("/:id/complete/:teilnehmerId", verifyToken, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });

    const teilnehmer = training.teilnehmer.id(req.params.teilnehmerId);
    if (!teilnehmer) return res.status(404).json({ message: "Teilnehmer nicht gefunden" });

    teilnehmer.bestanden = true;
    await training.save();

    res.json({ message: "Teilnehmer als bestanden markiert" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Markieren" });
  }
});

// 🔹 Modul hinzufügen
router.post("/:id/modules", verifyToken, async (req, res) => {
  try {
    const { titel, inhalt } = req.body;
    if (!titel) return res.status(400).json({ message: "Modul-Titel erforderlich" });

    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });

    training.module.push({ titel, inhalt });
    await training.save();

    res.json({ message: "Modul hinzugefügt", training });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Hinzufügen des Moduls" });
  }
});

// 🔹 Modul löschen
router.delete("/:id/modules/:moduleId", verifyToken, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });

    training.module.id(req.params.moduleId)?.deleteOne();
    await training.save();

    res.json({ message: "Modul gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen des Moduls" });
  }
});

export default router;
