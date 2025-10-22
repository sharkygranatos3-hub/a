import express from "express";
import jwt from "jsonwebtoken";
import Training from "../models/Training.js";
import Employee from "../models/Employee.js";

const router = express.Router();

// Middleware für Authentifizierung
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Kein Token vorhanden" });
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(403).json({ message: "Ungültiger Token" });
  }
}

// Alle Trainings / Ausbildungen abrufen
router.get("/", auth, async (req, res) => {
  try {
    const trainings = await Training.find().sort({ createdAt: -1 });
    res.json(trainings);
  } catch (err) {
    console.error("Fehler beim Abrufen der Trainings:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// Einzelnes Training abrufen
router.get("/:id", auth, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });
    res.json(training);
  } catch (err) {
    res.status(500).json({ message: "Serverfehler" });
  }
});

// Neues Training erstellen
router.post("/", auth, async (req, res) => {
  try {
    const neu = new Training({
      ...req.body,
      erstelltVon: req.user._id,
    });
    await neu.save();
    res.status(201).json(neu);
  } catch (err) {
    console.error("Fehler beim Erstellen:", err);
    res.status(500).json({ message: "Fehler beim Erstellen des Trainings" });
  }
});

// Training bearbeiten
router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Training.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Bearbeiten" });
  }
});

// Training löschen
router.delete("/:id", auth, async (req, res) => {
  try {
    await Training.findByIdAndDelete(req.params.id);
    res.json({ message: "Training gelöscht" });
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

// Anmeldung zu einem Training
router.post("/:id/join", auth, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });

    const bereits = training.teilnehmer.find((t) => t.mitarbeiterId.toString() === req.user._id);
    if (bereits) return res.status(400).json({ message: "Bereits angemeldet" });

    training.teilnehmer.push({
      mitarbeiterId: req.user._id,
      name: req.user.name,
      bestanden: false,
    });

    await training.save();
    res.json({ message: "Erfolgreich angemeldet" });
  } catch (err) {
    console.error("Fehler bei der Anmeldung:", err);
    res.status(500).json({ message: "Fehler bei der Anmeldung" });
  }
});

// Teilnehmer als bestanden markieren
router.put("/:id/mark", auth, async (req, res) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) return res.status(404).json({ message: "Training nicht gefunden" });

    const { teilnehmerId, bestanden } = req.body;
    const teilnehmer = training.teilnehmer.find((t) => t.mitarbeiterId.toString() === teilnehmerId);
    if (teilnehmer) teilnehmer.bestanden = bestanden;

    await training.save();
    res.json({ message: "Teilnehmerstatus aktualisiert" });
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Aktualisieren" });
  }
});

export default router;
