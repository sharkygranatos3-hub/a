import express from 'express';
import Event from '../models/Event.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Alle Events abrufen
router.get('/', authMiddleware, async (req,res)=>{
  try {
    const events = await Event.find().sort({startDate:1});
    res.json(events);
  } catch(e){ res.status(500).json({error:e.message}); }
});

// Event erstellen
router.post('/', authMiddleware, async (req,res)=>{
  try {
    const { title, startDate, endDate, type, group, description } = req.body;
    const event = new Event({
      title, startDate, endDate, type, group, description,
      createdBy: req.user.name,
      creatorId: req.user.id
    });
    await event.save();
    res.json(event);
  } catch(e){ res.status(500).json({error:e.message}); }
});

// Event bearbeiten
router.put('/:id', authMiddleware, async (req,res)=>{
  try{
    const event = await Event.findById(req.params.id);
    if(!event) return res.status(404).json({error:"Event nicht gefunden"});
    if(event.creatorId !== req.user.id && !['Chief','Ausbilder'].includes(req.user.rank)){
      return res.status(403).json({error:"Keine Berechtigung"});
    }
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {new:true});
    res.json(updated);
  } catch(e){ res.status(500).json({error:e.message}); }
});

// Event löschen
router.delete('/:id', authMiddleware, async (req,res)=>{
  try{
    const event = await Event.findById(req.params.id);
    if(!event) return res.status(404).json({error:"Event nicht gefunden"});
    if(event.creatorId !== req.user.id && !['Chief','Ausbilder'].includes(req.user.rank)){
      return res.status(403).json({error:"Keine Berechtigung"});
    }
    await Event.findByIdAndDelete(req.params.id);
    res.json({message:"Gelöscht"});
  } catch(e){ res.status(500).json({error:e.message}); }
});

export default router;
