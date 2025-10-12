import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import mongoose from "mongoose";

const router = express.Router();

//////////////////////////////////////////////
// 🔐 Middleware zur Token-Prüfung
//////////////////////////////////////////////
const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Kein Token angegeben" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token ungültig:", err);
    res.status(401).json({ message: "Token ungültig" });
  }
};

//////////////////////////////////////////////
// 📧 Schema für E-Mails
//////////////////////////////////////////////
const emailSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Email = mongoose.model("Email", emailSchema);

//////////////////////////////////////////////
// 📥 Posteingang abrufen
//////////////////////////////////////////////
router.get("/inbox", auth, async (req, res) => {
  try {
    const username = req.user.username;
    const inbox = await Email.find({ to: username }).sort({ date: -1 });
    res.json(inbox);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der E-Mails" });
  }
});

//////////////////////////////////////////////
// 📤 E-Mail senden
//////////////////////////////////////////////
router.post("/send", auth, async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body)
      return res.status(400).json({ message: "Alle Felder sind erforderlich" });

    // Empfänger überprüfen
    const recipient = await User.findOne({ username: to });
    if (!recipient)
      return res.status(404).json({ message: "Empfänger nicht gefunden" });

    const newMail = new Email({
      from: req.user.username,
      to,
      subject,
      body,
      date: new Date(),
    });

    await newMail.save();
    res.json({ message: "E-Mail erfolgreich gesendet", mail: newMail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Senden der E-Mail" });
  }
});

//////////////////////////////////////////////
// 📬 Gesendete E-Mails abrufen (optional)
//////////////////////////////////////////////
router.get("/sent", auth, async (req, res) => {
  try {
    const sent = await Email.find({ from: req.user.username }).sort({ date: -1 });
    res.json(sent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der gesendeten E-Mails" });
  }
});

export default router;
