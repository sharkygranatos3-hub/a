import express from "express";
import Training from "../models/Training.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// 🟦 Alle Trainings laden
router.get("/", verifyToken, async (req, res) => {
  try {
    const trainings = await Training.find().sort({ datum: -1 });
    res.json(trainings);
  } catch (err) {
    console.error("Fehler beim Laden der Trainings:", err);
    res.status(500).json({ message: "Fehler beim Laden der Trainings" });
  }
});

// 🟩 Einzelnes Training abrufen
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });
    res.json(training);
  } catch (err) {
    console.error("Fehler beim Laden eines Trainings:", err);
    res.status(500).json({ message: "Fehler beim Laden eines Trainings" });
  }
});

// 🟨 Neues Training / Ausbildung erstellen
router.post("/", verifyToken, async (req, res) => {
  try {
    const userRank = req.user.rank || req.user.role;
    if (!["Chief", "Instructor", "Co-Chief"].includes(userRank)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }

    const newTraining = new Training({
      titel: req.body.titel,
      beschreibung: req.body.beschreibung,
      trainer: req.user.name,
      ort: req.body.ort,
      datum: req.body.datum,
      maxTeilnehmer: req.body.maxTeilnehmer,
      zielgruppe: req.body.zielgruppe,
      erforderlichRang: req.body.erforderlichRang,
      module: req.body.module || [],
    });

    await newTraining.save();
    res.json(newTraining);
  } catch (err) {
    console.error("Fehler beim Erstellen eines Trainings:", err);
    res.status(500).json({ message: "Fehler beim Erstellen eines Trainings" });
  }
});

// 🟧 Training bearbeiten
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const userRank = req.user.rank || req.user.role;
    if (!["Chief", "Instructor", "Co-Chief"].includes(userRank)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }

    const updated = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error("Fehler beim Bearbeiten eines Trainings:", err);
    res.status(500).json({ message: "Fehler beim Bearbeiten eines Trainings" });
  }
});

// 🟥 Training löschen
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userRank = req.user.rank || req.user.role;
    if (!["Chief", "Instructor", "Co-Chief"].includes(userRank)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }

    await Training.findByIdAndDelete(req.params.id);
    res.json({ message: "Training gelöscht" });
  } catch (err) {
    console.error("Fehler beim Löschen eines Trainings:", err);
    res.status(500).json({ message: "Fehler beim Löschen eines Trainings" });
  }
});

// 🧍 Teilnehmer anmelden
router.post("/:id/join", verifyToken, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });

    const alreadyJoined = training.teilnehmer.some(t => t.id === req.user._id);
    if (alreadyJoined) return res.status(400).json({ message: "Bereits angemeldet" });

    training.teilnehmer.push({
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
    });

    await training.save();
    res.json(training);
  } catch (err) {
    console.error("Fehler beim Anmelden:", err);
    res.status(500).json({ message: "Fehler beim Anmelden" });
  }
});

// 🧾 Teilnehmer austragen
router.post("/:id/leave", verifyToken, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });

    training.teilnehmer = training.teilnehmer.filter(t => t.id !== req.user._id);
    await training.save();

    res.json(training);
  } catch (err) {
    console.error("Fehler beim Abmelden:", err);
    res.status(500).json({ message: "Fehler beim Abmelden" });
  }
});

export default router;
