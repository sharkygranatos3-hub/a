import express from "express";
import WikiEntry from "../models/wikiEntry.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Alle Einträge (öffentlich)
router.get("/", async (req, res) => {
  const entries = await WikiEntry.find().sort({ createdAt: -1 });
  res.json(entries);
});

// Neuer Eintrag (nur Chief oder Ausbilder)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.rank !== "Chief" && req.user.rank !== "Ausbilder")
    return res.status(403).json({ message: "Keine Berechtigung" });

  const { title, content } = req.body;
  const entry = new WikiEntry({
    title,
    content,
    authorName: req.user.name,
    authorRank: req.user.rank,
  });
  await entry.save();
  res.json(entry);
});

// Eintrag bearbeiten
router.put("/:id", authMiddleware, async (req, res) => {
  if (req.user.rank !== "Chief" && req.user.rank !== "Ausbilder")
    return res.status(403).json({ message: "Keine Berechtigung" });

  const entry = await WikiEntry.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(entry);
});

// Eintrag löschen
router.delete("/:id", authMiddleware, async (req, res) => {
  if (req.user.rank !== "Chief" && req.user.rank !== "Ausbilder")
    return res.status(403).json({ message: "Keine Berechtigung" });

  await WikiEntry.findByIdAndDelete(req.params.id);
  res.json({ message: "Eintrag gelöscht" });
});

export default router;
