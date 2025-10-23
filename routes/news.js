import express from 'express';
import News from '../models/News.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Alle News abrufen
router.get('/', authMiddleware, async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Laden der News' });
  }
});

// Neue News erstellen
router.post('/', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const { rank, name } = req.user;

  if (!['Chief','Ausbilder'].includes(rank)) {
    return res.status(403).json({ message: 'Keine Berechtigung' });
  }

  if (!title || !content) return res.status(400).json({ message: 'Titel und Inhalt erforderlich' });

  try {
    const news = new News({ title, content, author: name });
    await news.save();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Erstellen' });
  }
});

// News bearbeiten
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const { rank } = req.user;

  if (!['Chief','Ausbilder'].includes(rank)) {
    return res.status(403).json({ message: 'Keine Berechtigung' });
  }

  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: 'News nicht gefunden' });

    news.title = title || news.title;
    news.content = content || news.content;
    await news.save();

    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Bearbeiten' });
  }
});

// News löschen
router.delete('/:id', authMiddleware, async (req, res) => {
  const { rank } = req.user;

  if (!['Chief','Ausbilder'].includes(rank)) {
    return res.status(403).json({ message: 'Keine Berechtigung' });
  }

  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'News gelöscht' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Fehler beim Löschen' });
  }
});

export default router;
