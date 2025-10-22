import express from "express";
import Training from "../models/Training.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// Alle Trainings
router.get("/", verifyToken, async (req, res) => {
  try {
    const trainings = await Training.find().sort({ datetime: 1 });
    res.json(trainings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Trainings" });
  }
});

// Neues Training erstellen
router.post("/", verifyToken, async (req, res) => {
  try {
    const newTraining = new Training(req.body);
    await newTraining.save();
    res.json(newTraining);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen" });
  }
});

// Training bearbeiten
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updated = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Aktualisieren" });
  }
});

// Training löschen
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Training.findByIdAndDelete(req.params.id);
    res.json({ message: "Gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

// Teilnehmer anmelden
router.post("/:id/join", verifyToken, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if(!training.participants.includes(req.user._id)){
      training.participants.push(req.user._id);
      await training.save();
    }
    res.json(training);
  } catch(err){
    console.error(err);
    res.status(500).json({ message: "Fehler bei Anmeldung" });
  }
});

export default router;
