import express from "express";
import Event from "../models/Event.js";
import authMiddleware from "../middleware/auth.js"; // ✅ kein { } mehr

const router = express.Router();

// Alle Events abrufen
router.get("/", authMiddleware, async (req, res) => {
  try {
    const events = await Event.find().sort({ start: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Laden der Termine" });
  }
});

// Neues Event erstellen
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, start, end, type, group, desc } = req.body;

    const userId = req.user.id || req.user._id || req.user.userId;
    const userName = req.user.name || req.user.username || "Unbekannt";
    const userRank = req.user.rank || "Officer";

    const newEvent = new Event({
      title,
      start,
      end,
      type,
      group,
      desc,
      owner: userId,
      ownerName: userName,
      ownerRank: userRank,
    });

    await newEvent.save();
    res.json(newEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen" });
  }
});


// Event bearbeiten
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Nicht gefunden" });

    // Berechtigung prüfen
    if (event.owner.toString() !== req.user.id && !["Chief", "Ausbilder"].includes(req.user.rank)) {
      return res.status(403).json({ message: "Keine Berechtigung zum Bearbeiten" });
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
    if (!event) return res.status(404).json({ message: "Nicht gefunden" });

    // Berechtigung prüfen
    if (event.owner.toString() !== req.user.id && !["Chief", "Ausbilder"].includes(req.user.rank)) {
      return res.status(403).json({ message: "Keine Berechtigung zum Löschen" });
    }

    await event.deleteOne();
    res.json({ message: "Event gelöscht" });
  } catch (err) {
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

export default router;
