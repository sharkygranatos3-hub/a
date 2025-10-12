import express from "express";
import Email from "../models/Email.js";
import User from "../models/User.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// ----------------------------
// Posteingang laden
// ----------------------------
router.get("/inbox", verifyToken, async (req, res) => {
  try {
    const emails = await Email.find({ to: req.user.id })
      .populate("from", "vorname nachname username")
      .sort({ createdAt: -1 });

    const formatted = emails.map(e => ({
      id: e._id,
      subject: e.subject,
      body: e.body,
      from: e.from.username,
      fromName: `${e.from.vorname} ${e.from.nachname}`,
      images: e.images,
      read: e.read,
      createdAt: e.createdAt
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden des Posteingangs" });
  }
});

// ----------------------------
// Gesendete Mails laden
// ----------------------------
router.get("/sent", verifyToken, async (req, res) => {
  try {
    const emails = await Email.find({ from: req.user.id })
      .populate("to", "vorname nachname username")
      .sort({ createdAt: -1 });

    const formatted = emails.map(e => ({
      id: e._id,
      subject: e.subject,
      body: e.body,
      to: e.to.username,
      toName: `${e.to.vorname} ${e.to.nachname}`,
      images: e.images,
      read: e.read,
      createdAt: e.createdAt
    }));
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der gesendeten Mails" });
  }
});

// ----------------------------
// Mail senden
// ----------------------------
router.post("/send", verifyToken, async (req, res) => {
  try {
    const { toUsername, subject, body, images } = req.body;

    if (!toUsername || !subject || !body)
      return res.status(400).json({ message: "Empfänger, Betreff und Nachricht sind Pflicht" });

    const recipient = await User.findOne({ username: toUsername });
    if (!recipient) return res.status(400).json({ message: "Empfänger existiert nicht" });

    // Sicherstellen, dass images ein Array ist
    const imageArray = Array.isArray(images) ? images : [];

    const email = new Email({
      from: req.user.id,
      to: recipient._id,
      subject,
      body,
      images: imageArray,
      read: false
    });

    await email.save();
    res.json({ message: "E-Mail gesendet" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Senden der E-Mail" });
  }
});

// ----------------------------
// Mail löschen
// ----------------------------
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) return res.status(404).json({ message: "E-Mail nicht gefunden" });

    if (email.from.toString() !== req.user.id && email.to.toString() !== req.user.id)
      return res.status(403).json({ message: "Keine Berechtigung" });

    await Email.findByIdAndDelete(req.params.id);
    res.json({ message: "E-Mail gelöscht" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen der E-Mail" });
  }
});

// ----------------------------
// Mail als gelesen markieren
// ----------------------------
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) return res.status(404).json({ message: "E-Mail nicht gefunden" });

    if (email.to.toString() !== req.user.id) return res.status(403).json({ message: "Keine Berechtigung" });

    email.read = true;
    await email.save();
    res.json({ message: "E-Mail als gelesen markiert" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Aktualisieren der E-Mail" });
  }
});

export default router;
