import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import { sendEmail, getInbox, getSent, getEmailById } from "../controllers/emailController.js";
import verifyToken from "../middleware/auth.js";

const router = express.Router();

// 📂 Upload-Verzeichnis bestimmen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📤 Multer-Konfiguration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// 📧 E-Mail-Routen
router.post("/send", verifyToken, upload.single("attachment"), sendEmail);
router.get("/inbox", verifyToken, getInbox);
router.get("/sent", verifyToken, getSent);
router.get("/:id", verifyToken, getEmailById);

export default router;
