import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware Auth
const auth = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if(!token) return res.status(401).json({ message: "Kein Token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch(err) {
    res.status(401).json({ message: "Token ungültig" });
  }
};

// Alle Mitarbeiter abrufen
router.get("/", auth, async (req,res) => {
  try {
    const employees = await User.find({}, "-password"); // Passwort nicht zurückgeben
    res.json(employees);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Mitarbeiter" });
  }
});

// Mitarbeiter erstellen (nur Chief/Co-Chief)
router.post("/", auth, async (req,res) => {
  try {
    if(req.user.rank !== "Chief" && req.user.rank !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const { vorname, nachname, username, password, rang } = req.body;
    const newUser = new User({ vorname, nachname, username, password, rang });
    await newUser.save();
    res.json(newUser);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Erstellen" });
  }
});

// Bearbeiten
router.put("/:id", auth, async (req,res) => {
  try {
    if(req.user.rank !== "Chief" && req.user.rank !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    const emp = await User.findById(req.params.id);
    if(!emp) return res.status(404).json({ message: "Nicht gefunden" });

    Object.assign(emp, req.body);
    await emp.save();
    res.json(emp);
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Bearbeiten" });
  }
});

// Löschen
router.delete("/:id", auth, async (req,res) => {
  try {
    if(req.user.rank !== "Chief" && req.user.rank !== "Co-Chief")
      return res.status(403).json({ message: "Keine Berechtigung" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Gelöscht" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

export default router;
