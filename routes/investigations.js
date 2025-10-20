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
      zeugen: Array.isArray(zeugen)
        ? zeugen
        : zeugen
        ? zeugen.split(",").map(z => z.trim())
        : [],
      beamte: Array.isArray(beamte)
        ? beamte
        : beamte
        ? beamte.split(",").map(b => b.trim())
        : [],
      aktenzeichen,
      createdBy: req.user._id,
      eintraege: []
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
    const {
      beschuldigter,
      tatvorwurf,
      tattag,
      tatzeit,
      tatort,
      zeugen,
      beamte
    } = req.body;

    const akte = await Investigation.findById(req.params.id);
    if (!akte) return res.status(404).json({ message: "Akte nicht gefunden" });

    if (beschuldigter !== undefined) akte.beschuldigter = beschuldigter;
    if (tatvorwurf !== undefined) akte.tatvorwurf = tatvorwurf;
    if (tattag !== undefined) akte.tattag = tattag;
    if (tatzeit !== undefined) akte.tatzeit = tatzeit;
    if (tatort !== undefined) akte.tatort = tatort;

    if (Array.isArray(zeugen)) {
      akte.zeugen = zeugen.filter(z => z && z.trim() !== "");
    } else if (typeof zeugen === "string") {
      akte.zeugen = zeugen.split(",").map(z => z.trim());
    }

    if (Array.isArray(beamte)) {
      akte.beamte = beamte.filter(b => b && b.trim() !== "");
    } else if (typeof beamte === "string") {
      akte.beamte = beamte.split(",").map(b => b.trim());
    }

    akte.updatedAt = new Date();
    await akte.save();

    res.json({ message: "Ermittlungsakte aktualisiert", akte });
  } catch (err) {
    console.error("Fehler beim Aktualisieren der Akte:", err);
    res.status(500).json({ message: "Fehler beim Aktualisieren der Ermittlungsakte" });
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

    if (!akte.eintraege) akte.eintraege = [];

    akte.eintraege.push({
      datum: datum || new Date().toLocaleString("de-DE"),
      inhalt,
      medien: medien || [],
      createdBy: {
        id: req.user._id,
        name: req.user.name || "Unbekannt"
      }
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
