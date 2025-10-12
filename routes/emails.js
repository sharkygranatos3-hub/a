import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* -------------------------
   Auth Middleware
   ------------------------- */
const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Kein Token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verify error:", err);
    res.status(401).json({ message: "Token ungültig" });
  }
};

/* -------------------------
   Multer (Datei Upload)
   - Lokaler Speicher in /uploads
   - Achtung: auf Render ist FS ephemer (siehe Hinweise weiter unten)
   ------------------------- */
const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // safe unique filename: timestamp + orig name
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${Math.round(Math.random()*1e6)}-${name}${ext}`);
  }
});
const upload = multer({ storage });

/* Helper: build public URL for uploaded file */
const baseUrl = process.env.BASE_URL || ""; // z.B. https://leitstelle-backend.onrender.com
function fileUrl(filename) {
  if (!filename) return null;
  return `${baseUrl.replace(/\/$/, "")}/uploads/${filename}`;
}

/* -------------------------
   GET /api/emails       -> Inbox (nur incoming, sent=false)
   GET /api/emails/sent  -> Sent (sent=true)
   POST /api/emails      -> Send + upload attachments (multer)
   DELETE /api/emails/:mailId -> delete mail from your mailbox
   ------------------------- */

/* Inbox */
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "emails");
    if (!user) return res.status(404).json({ message: "Nutzer nicht gefunden" });
    const inbox = (user.emails || []).filter(m => !m.sent);
    res.json(inbox);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der E-Mails" });
  }
});

/* Sent */
router.get("/sent", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id, "emails");
    if (!user) return res.status(404).json({ message: "Nutzer nicht gefunden" });
    const sent = (user.emails || []).filter(m => m.sent);
    res.json(sent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der gesendeten E-Mails" });
  }
});

/* Send email with optional attachments
   multipart/form-data expected:
   fields: to, subject, body
   files: attachments (multiple)
*/
router.post("/", auth, upload.array("attachments", 6), async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) return res.status(400).json({ message: "Alle Felder ausfüllen" });

    // Empfänger prüfen (username field in users)
    const recipient = await User.findOne({ username: to });
    if (!recipient) return res.status(404).json({ message: "Empfänger nicht gefunden" });

    // attachments map
    const attachments = (req.files || []).map(f => ({
      filename: f.originalname,
      storedFilename: f.filename,
      url: fileUrl(f.filename),
      size: f.size,
      mimetype: f.mimetype
    }));

    // E-Mail Objekt
    const newMail = {
      from: req.user.username,
      to,
      subject,
      body,
      date: new Date(),
      sent: false,
      attachments
    };

    // Empfänger Postfach
    recipient.emails = recipient.emails || [];
    recipient.emails.push(newMail);
    await recipient.save();

    // Sender: Kopie in sent folder
    const sender = await User.findById(req.user.id);
    sender.emails = sender.emails || [];
    sender.emails.push({ ...newMail, sent: true });
    await sender.save();

    res.json({ message: "E-Mail gesendet" });
  } catch (err) {
    console.error("POST /api/emails error:", err);
    res.status(500).json({ message: "Fehler beim Senden der E-Mail" });
  }
});

/* DELETE mail from own mailbox */
router.delete("/:mailId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Nutzer nicht gefunden" });

    const mail = user.emails.id(req.params.mailId);
    if (!mail) return res.status(404).json({ message: "E-Mail nicht gefunden" });

    // entferne dateien vom Filesystem nur wenn sie eindeutig zu diesem user gehören
    if (mail.attachments && mail.attachments.length) {
      for (const a of mail.attachments) {
        try {
          const p = path.join(uploadsDir, a.storedFilename || "");
          if (p && p.startsWith(uploadsDir) && fs.existsSync(p)) fs.unlinkSync(p);
        } catch (e) { /* ignore unlink errors */ }
      }
    }

    mail.remove();
    await user.save();
    res.json({ message: "E-Mail gelöscht" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen der E-Mail" });
  }
});

export default router;
