// routes/investigations.js
import express from "express";
import Investigation from "../models/Investigation.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// ----------------------------
// Hilfsfunktion für Aktenzeichen
// ----------------------------
async function generateAktenzeichen() {
  const year = new Date().getFullYear().toString().slice(-2); // z. B. "25"
  const count = await Investigation.countDocuments({});
  const number = count + 1;
  return `LSPD ${number}/${year}`;
}

// ----------------------------
// Alle Ermittlungen abrufen
// ----------------------------
router.get("/", verifyToken, async (req, res) => {
  try {
    const investigations = await Investigation.find().sort({ createdAt: -1 });
    res.json(investigations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Ermittlungen" });
  }
});

// ----------------------------
// Neue Ermittlung anlegen
// ----------------------------
router.post("/", verifyToken, async (req, res) => {
  try {
    const { beschuldigter, tatvorwurf, tattag, tatzeit, tatort, zeugen, beamte } = req.body;
    if (!beschuldigter || !tatvorwurf)
      return res.status(400).json({ message: "Beschuldigter und Tatvorwurf sind erforderlich" });

    const aktenzeichen = await generateAktenzeichen();

    const newInvestigation = new Investigation({
      beschuldigter,
      tatvorwurf,
      tattag,
      tatzeit,
      tatort,
      zeugen,
      beamte,
      aktenzeichen,
      entries: []
    });

    await newInvestigation.save();
    res.json({ message: "Ermittlung erfolgreich angelegt", investigation: newInvestigation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Anlegen der Ermittlung" });
  }
});

// ----------------------------
// Einzelne Ermittlung abrufen
// ----------------------------
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const inv = await Investigation.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: "Ermittlung nicht gefunden" });
    res.json(inv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Ermittlung" });
  }
});

// ----------------------------
// Grunddaten einer Ermittlung bearbeiten
// ----------------------------
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updated = await Investigation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Ermittlung nicht gefunden" });
    res.json({ message: "Ermittlung aktualisiert", updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Aktualisieren der Ermittlung" });
  }
});

// ----------------------------
// Eintrag zu Ermittlungsakte hinzufügen
// ----------------------------
router.post("/:id/entries", verifyToken, async (req, res) => {
  try {
    const { datum, inhalt, medien } = req.body;
    const akte = await Investigation.findById(req.params.id);

    if (!akte) return res.status(404).json({ message: "Akte nicht gefunden" });

    if (!akte.entries) akte.entries = [];

    akte.entries.push({
      datum: datum || new Date().toLocaleDateString("de-DE"),
      inhalt,
      medien: medien || []
    });

    await akte.save();
    res.json({ message: "Eintrag hinzugefügt", akte });
  } catch (err) {
    console.error("Fehler beim Hinzufügen eines Eintrags:", err);
    res.status(500).json({ message: "Fehler beim Hinzufügen des Eintrags" });
  }
});

// ----------------------------
// Ermittlungsakte löschen
// ----------------------------
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Investigation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Ermittlung nicht gefunden" });
    res.json({ message: "Ermittlung gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen der Ermittlung" });
  }
});

export default router;
