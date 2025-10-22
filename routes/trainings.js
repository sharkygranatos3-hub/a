// routes/trainings.js
const trainings = await Training.find().select("title description trainer trainerName datetime target").sort({ datetime: 1 });
res.json(trainings);
}catch(err){ console.error(err); res.status(500).json({ message: "Fehler beim Laden der Inhalte" }); }
});


// GET /api/trainings/:id - einzelnes Training
router.get("/:id", verifyToken, async (req,res)=>{
try{
const t = await Training.findById(req.params.id);
if(!t) return res.status(404).json({ message: "Training nicht gefunden" });
res.json(t);
}catch(err){ console.error(err); res.status(500).json({ message: "Fehler" }); }
});


// POST /api/trainings - erstellen (Admin/Instructor)
router.post("/", verifyToken, async (req,res)=>{
try{
if(!isAdminOrInstructor(req.user)) return res.status(403).json({ message: "Keine Berechtigung" });
const { title, description, trainer, trainerName, datetime, maxParticipants, target } = req.body;
if(!title) return res.status(400).json({ message: "Titel erforderlich" });


const t = new Training({
title,
description: description || "",
trainer: trainer || req.user.username,
trainerName: trainerName || req.user.name || "",
datetime: datetime ? new Date(datetime) : null,
maxParticipants: maxParticipants || 20,
target: target || "All",
createdBy: req.user._id
});
await t.save();
res.json({ message: "Training erstellt", training: t });
}catch(err){ console.error(err); res.status(500).json({ message: "Fehler beim Erstellen" }); }
});


// PUT /api/trainings/:id - bearbeiten (Admin/Instructor)
router.put("/:id", verifyToken, async (req,res)=>{
try{
if(!isAdminOrInstructor(req.user)) return res.status(403).json({ message: "Keine Berechtigung" });
const update = { ...req.body };
if(update.datetime) update.datetime = new Date(update.datetime);
const updated = await Training.findByIdAndUpdate(req.params.id, update, { new:true });
if(!updated) return res.status(404).json({ message: "Training nicht gefunden" });
res.json({ message: "Training aktualisiert", training: updated });
}catch(err){ console.error(err); res.status(500).json({ message: "Fehler beim Aktualisieren" }); }
});


// DELETE /api/trainings/:id - löschen (Admin/Instructor)
router.delete("/:id", verifyToken, async (req,res)=>{
try{
if(!isAdminOrInstructor(req.user)) return res.status(403).json({ message: "Keine Berechtigung" });
const deleted = await Training.findByIdAndDelete(req.params.id);
if(!deleted) return res.status(404).json({ message: "Training nicht gefunden" });
res.json({ message: "Training gelöscht" });
}catch(err){ console.error(err); res.status(500).json({ message: "Fehler beim Löschen" }); }
});


// POST /api/trainings/:id/signup - anmelden (jeder angemeldete User)
router.post("/:id/signup", verifyToken, async (req,res)=>{
try{
const t = await Training.findById(req.params.id);
if(!t) return res.status(404).json({ message: "Training nicht gefunden" });
const username = req.body.username || req.user.username;
const name = req.body.name || req.user.name || username;


// check duplicate
if((t.participants||[]).some(p => p.username === username)) return res.status(400).json({ message: "Schon angemeldet" });
if(t.maxParticipants && (t.participants||[]).length >= t.maxParticipants) return res.status(400).json({ message: "Teilnehmerlimit erreicht" });


t.participants.push({ username, name, status: 'registered' });
await t.save();
res.json({ message: "Angemeldet" });
}catch(err){ console.error(err); res.status(500).json({ message: "Fehler bei der Anmeldung" }); }
});


// GET /api/trainings/:id/participants - Teilnehmerliste (Admin/Trainer)
router.get("/:id/participants", verifyToken, async (req,res)=>{
try{
const t = await Training.findById(req.params.id);
if(!t) return res.status(404).json({ message: "Training nicht gefunden" });
// nur Admin oder der Trainer selbst darf komplette Liste sehen
const isTrainer = (t.trainer === req.user.username) || isAdminOrInstructor(req.user);
if(!isTrainer) return res.status(403).json({ message: "Keine Berechtigung" });
res.json(t.participants || []);
}catch(err){ console.error(err); res.status(500).json({ message: "Fehler" }); }
});


export default router;
