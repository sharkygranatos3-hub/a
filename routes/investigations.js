import express from "express";
import Investigation from "../models/Investigation.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// ----------------------------
// Hilfsfunktion Aktenzeichen
// ----------------------------
async function generateAktenzeichen() {
  const year = new Date().getFullYear().toString().slice(-2);
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
      eintraege: [],
      status: "Offen",
      urgent: false,
      archived: false,
      createdBy: req.user._id
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
// Grunddaten bearbeiten
// ----------------------------
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updated = await Investigation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Akte nicht gefunden" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Aktualisieren der Akte" });
  }
});

// ----------------------------
// Archivieren
// ----------------------------
router.put("/:id/archive", verifyToken, async (req, res) => {
  try {
    const archived = await Investigation.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });
    if (!archived) return res.status(404).json({ message: "Ermittlung nicht gefunden" });
    res.json({ message: "Ermittlung archiviert", archived });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Archivieren" });
  }
});

// ----------------------------
// Wiederherstellen
// ----------------------------
router.put("/:id/restore", verifyToken, async (req, res) => {
  try {
    const restored = await Investigation.findByIdAndUpdate(req.params.id, { archived: false }, { new: true });
    if (!restored) return res.status(404).json({ message: "Ermittlung nicht gefunden" });
    res.json({ message: "Ermittlung wiederhergestellt", restored });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Wiederherstellen" });
  }
});

// ----------------------------
// Status & Eilt ändern
// ----------------------------
router.put("/:id/status", verifyToken, async (req, res) => {
  try {
    const { status, urgent } = req.body;
    const updated = await Investigation.findByIdAndUpdate(
      req.params.id,
      { status, urgent },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Ermittlung nicht gefunden" });
    res.json({ message: "Status aktualisiert", updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Aktualisieren des Status" });
  }
});

// ----------------------------
// Eintrag hinzufügen
// ----------------------------
router.post("/:id/entries", verifyToken, async (req, res) => {
  try {
    const { datum, inhalt, medien } = req.body;
    const akte = await Investigation.findById(req.params.id);
    if (!akte) return res.status(404).json({ message: "Akte nicht gefunden" });

    akte.eintraege.push({
      datum: datum || new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }),
      inhalt,
      medien: medien || [],
      createdBy: { id: req.user._id, name: req.user.name || "Unbekannt" }
    });

    await akte.save();
    res.json({ message: "Eintrag hinzugefügt", akte });
  } catch (err) {
    console.error("Fehler beim Hinzufügen eines Eintrags:", err);
    res.status(500).json({ message: "Fehler beim Hinzufügen des Eintrags" });
  }
});

// ----------------------------
// Eintrag bearbeiten
// ----------------------------
router.put("/:id/entries/:entryId", verifyToken, async (req, res) => {
  try {
    const { inhalt, medien } = req.body;
    const akte = await Investigation.findById(req.params.id);
    if (!akte) return res.status(404).json({ message: "Akte nicht gefunden" });

    const entry = akte.eintraege.id(req.params.entryId);
    if (!entry) return res.status(404).json({ message: "Eintrag nicht gefunden" });

    if (!entry.createdBy || entry.createdBy.id.toString() !== req.user._id)
      return res.status(403).json({ message: "Keine Berechtigung zum Bearbeiten" });

    entry.inhalt = inhalt || entry.inhalt;
    entry.medien = medien || entry.medien;
    datum: datum || new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }),

    await akte.save();
    res.json({ message: "Eintrag aktualisiert", entry });
  } catch (err) {
    console.error("Fehler beim Bearbeiten eines Eintrags:", err);
    res.status(500).json({ message: "Fehler beim Bearbeiten des Eintrags" });
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

