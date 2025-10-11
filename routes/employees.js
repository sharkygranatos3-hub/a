// Mitarbeiterakte abrufen
router.get("/akte/:id", auth, async (req, res) => {
  try {
    const emp = await User.findById(req.params.id, "-password");
    if (!emp) return res.status(404).json({ message: "Nicht gefunden" });
    res.json(emp.akte || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Laden der Akte" });
  }
});

// Eintrag zur Akte hinzufügen
router.post("/akte/:id", auth, async (req, res) => {
  try {
    const { type, text } = req.body;
    if (!type || !text) return res.status(400).json({ message: "Typ und Text benötigt" });

    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Nicht gefunden" });

    emp.akte.push({ type, text, createdBy: req.user.username });
    await emp.save();
    res.json(emp.akte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Hinzufügen des Eintrags" });
  }
});

// Eigenes Passwort ändern
router.put("/changepassword/:id", auth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Neues Passwort benötigt" });

    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: "Nicht gefunden" });

    // Nur eigener User oder Chief/Co-Chief
    if (req.user._id !== emp._id.toString() && req.user.rang !== "Chief" && req.user.rang !== "Co-Chief") {
      return res.status(403).json({ message: "Keine Berechtigung" });
    }

    emp.password = password; // später bcrypt-Hashen beim Speichern
    await emp.save();
    res.json({ message: "Passwort geändert" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fehler beim Ändern des Passworts" });
  }
});
