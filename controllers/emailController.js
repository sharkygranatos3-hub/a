import Email from "../models/Email.js";
import User from "../models/User.js";
import path from "path";

// 📤 E-Mail senden
export const sendEmail = async (req, res) => {
  try {
    const { subject, body, to, replyTo } = req.body;

    if (!subject || !body || !to) {
      return res.status(400).json({ message: "Betreff, Empfänger und Nachricht sind erforderlich" });
    }

    const sender = await User.findById(req.user.id);
    const recipient = await User.findOne({ username: to });

    if (!recipient) {
      return res.status(404).json({ message: "Empfänger nicht gefunden" });
    }

    const attachment = req.file ? `/uploads/${req.file.filename}` : null;

    const email = new Email({
      from: sender.username,
      to: recipient.username,
      subject,
      body,
      attachment,
      replyTo: replyTo || null
    });

    await email.save();
    res.json({ message: "E-Mail erfolgreich gesendet", email });
  } catch (error) {
    console.error("Fehler beim Senden:", error);
    res.status(500).json({ message: "Fehler beim Senden der E-Mail" });
  }
};

// 📥 Posteingang abrufen
export const getInbox = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const inbox = await Email.find({ to: user.username }).sort({ date: -1 });
    res.json(inbox);
  } catch (error) {
    console.error("Fehler beim Abrufen des Posteingangs:", error);
    res.status(500).json({ message: "Fehler beim Laden des Posteingangs" });
  }
};

// 📤 Gesendete Mails abrufen
export const getSent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const sent = await Email.find({ from: user.username }).sort({ date: -1 });
    res.json(sent);
  } catch (error) {
    console.error("Fehler beim Laden der gesendeten Mails:", error);
    res.status(500).json({ message: "Fehler beim Laden der gesendeten Mails" });
  }
};

// 📬 Einzelne Mail anzeigen
export const getEmailById = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) return res.status(404).json({ message: "E-Mail nicht gefunden" });

    // Nur Absender oder Empfänger dürfen die Mail sehen
    if (email.to !== req.user.username && email.from !== req.user.username)
      return res.status(403).json({ message: "Keine Berechtigung" });

    // Mail als gelesen markieren
    if (email.to === req.user.username && !email.read) {
      email.read = true;
      await email.save();
    }

    res.json(email);
  } catch (error) {
    console.error("Fehler beim Laden der E-Mail:", error);
    res.status(500).json({ message: "Fehler beim Laden der E-Mail" });
  }
};
