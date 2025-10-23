import express from "express";
import WikiEntry from "../models/wikiEntry.js";
import { verifyToken, requireRole } from "../middleware/auth.js";

const router = express.Router();

// 📖 Alle Einträge abrufen (öffentlich)
router.get("/", async (req, res) => {
  try {
    const entries = await WikiEntry.find().sort({ updatedAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error("Fehler beim Laden:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// ➕ Neuer Eintrag (Chief/Ausbilder)
router.post("/", verifyToken, requireRole("Chief", "Ausbilder"), async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content)
    return res.status(400).json({ message: "Titel und Inhalt erforderlich" });

  try {
    const newEntry = new WikiEntry({
      title,
      content,
      author: req.user.name,
    });
    await newEntry.save();
    res.json(newEntry);
  } catch (err) {
    console.error("Fehler beim Erstellen:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// ✏️ Eintrag bearbeiten
router.put("/:id", verifyToken, requireRole("Chief", "Ausbilder"), async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const updated = await WikiEntry.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Eintrag nicht gefunden" });
    res.json(updated);
  } catch (err) {
    console.error("Fehler beim Aktualisieren:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// ❌ Eintrag löschen
router.delete("/:id", verifyToken, requireRole("Chief", "Ausbilder"), async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await WikiEntry.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Eintrag nicht gefunden" });
    res.json({ message: "Eintrag gelöscht" });
  } catch (err) {
    console.error("Fehler beim Löschen:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

export default router;
