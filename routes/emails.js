import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Email from "../models/Email.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Auth-Middleware
const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Kein Token vorhanden" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Ungültiger Token" });
  }
};

// Multer Upload Config
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// 📥 Posteingang abrufen
router.get("/inbox", auth, async (req, res) => {
  try {
    const mails = await Email.find({ to: req.user.username }).sort({ date: -1 });
    const users = await User.find({}, "username vorname nachname");
    const nameMap = Object.fromEntries(users.map(u => [u.username, `${u.vorname} ${u.nachname}`]));
    const mailsWithNames = mails.map(m => ({
      ...m.toObject(),
      fromName: nameMap[m.from] || m.from,
      toName: nameMap[m.to] || m.to
    }));
    res.json(mailsWithNames);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden des Posteingangs" });
  }
});

// 📤 E-Mail senden
router.post("/send", auth, upload.single("attachment"), async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    const recipient = await User.findOne({ username: to });
    if (!recipient) return res.status(404).json({ message: "Empfänger nicht gefunden" });

    const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const mail = new Email({
      from: req.user.username,
      to,
      subject,
      body,
      attachment: attachmentUrl,
    });
    await mail.save();

    res.json({ success: true, mail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Fehler beim Senden" });
  }
});

// 📂 Anhänge ausliefern
router.use("/attachments", express.static("uploads"));

// 📬 Einzelne Mail abrufen
router.get("/:id", auth, async (req, res) => {
  try {
    const mail = await Email.findById(req.params.id);
    if (!mail) return res.status(404).json({ message: "E-Mail nicht gefunden" });

    if (mail.to !== req.user.username && mail.from !== req.user.username)
      return res.status(403).json({ message: "Keine Berechtigung" });

    mail.read = true;
    await mail.save();

    res.json(mail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Abrufen der E-Mail" });
  }
});

export default router;
