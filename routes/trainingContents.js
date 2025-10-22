import express from "express";
import Content from "../models/Content.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// ----------------------------
// Alle Inhalte abrufen
// ----------------------------
router.get("/", verifyToken, async (req, res) => {
  try {
    const contents = await Content.find().sort({ createdAt: -1 });
    res.json(contents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Inhalte" });
  }
});

// ----------------------------
// Inhalt erstellen (nur Admin / Ausbilder / Chief)
// ----------------------------
router.post("/", verifyToken, async (req, res) => {
  try {
    const { titel, beschreibung, modules } = req.body;
    if (!titel) return res.status(400).json({ message: "Titel ist erforderlich" });

    if (!["Chief", "Instructor", "Co-Chief", "Ausbilder"].includes(req.user.rank))
      return res.status(403).json({ message: "Keine Berechtigung" });

    const newContent = new Content({
      titel,
      beschreibung,
      modules: modules || [],
      createdBy: req.user._id
    });

    await newContent.save();
    res.json({ message: "Inhalt erstellt", content: newContent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen des Inhalts" });
  }
});

// ----------------------------
// Einzelnen Inhalt abrufen
// ----------------------------
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Inhalt nicht gefunden" });
    res.json(content);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden des Inhalts" });
  }
});

// ----------------------------
// Inhalt bearbeiten
// ----------------------------
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { titel, beschreibung, modules } = req.body;
    const content = await Content.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Inhalt nicht gefunden" });

    if (!["Chief", "Instructor", "Co-Chief", "Ausbilder"].includes(req.user.rank))
      return res.status(403).json({ message: "Keine Berechtigung" });

    if (titel) content.titel = titel;
    if (beschreibung) content.beschreibung = beschreibung;
    if (modules) content.modules = modules;
    content.updatedAt = new Date();

    await content.save();
    res.json({ message: "Inhalt aktualisiert", content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Bearbeiten des Inhalts" });
  }
});

// ----------------------------
// Inhalt löschen
// ----------------------------
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (!["Chief", "Instructor", "Co-Chief", "Ausbilder"].includes(req.user.rank))
      return res.status(403).json({ message: "Keine Berechtigung" });

    const deleted = await Content.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Inhalt nicht gefunden" });
    res.json({ message: "Inhalt gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen des Inhalts" });
  }
});

export default router;
