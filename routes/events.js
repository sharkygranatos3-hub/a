import express from "express";
import Event from "../models/Event.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Alle Events abrufen
router.get("/", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find().sort({ start: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Laden der Events" });
  }
});

// Neues Event erstellen
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, start, end, type, group, desc } = req.body;
    const user = req.user;
    const newEvent = new Event({
      title,
      start,
      end,
      type,
      group,
      desc,
      owner: user.id,
      ownerName: user.name
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Erstellen des Events" });
  }
});

// Event bearbeiten
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event nicht gefunden" });

    // Berechtigungen
    if (event.owner !== req.user.id && !["Chief", "Instructor"].includes(req.user.rank)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }

    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Bearbeiten" });
  }
});

// Event löschen
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event nicht gefunden" });

    // Nur Chief, Ausbilder oder Eigentümer dürfen löschen
    if (event.owner !== req.user.id && !["Chief", "Instructor"].includes(req.user.rank)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }

    await event.deleteOne();
    res.json({ message: "Event gelöscht" });
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

export default router;
