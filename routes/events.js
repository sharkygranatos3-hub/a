import express from "express";
import Event from "../models/event.js";
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
    const newEvent = new Event({
      title,
      start,
      end,
      type,
      group,
      desc,
      owner: req.user.id,
      ownerName: req.user.name,
      ownerRank: req.user.rank,
    });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Erstellen des Events" });
  }
});

// Event aktualisieren
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event nicht gefunden" });

    // Nur Owner oder Chief/Ausbilder dürfen bearbeiten
    if (event.owner.toString() !== req.user.id && !["Chief", "Ausbilder"].includes(req.user.rank)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }

    Object.assign(event, req.body);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Aktualisieren des Events" });
  }
});

// Event löschen
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event nicht gefunden" });

    // Nur Owner oder Chief/Ausbilder dürfen löschen
    if (event.owner.toString() !== req.user.id && !["Chief", "Ausbilder"].includes(req.user.rank)) {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }

    await event.deleteOne();
    res.json({ message: "Event gelöscht" });
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Löschen des Events" });
  }
});

export default router;
