import express from "express";
const router = express.Router();

/**
 * 🔐 POST /api/auth/login
 * Test-Login (später mit Datenbank ersetzen)
 */
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Beispielbenutzer
  if (username === "admin" && password === "12345") {
    return res.json({
      token: "dummy-token-admin",
      rank: "Chief",
      username: "admin"
    });
  }

  // Falls falsche Eingabe
  return res.status(401).json({ message: "Ungültige Anmeldedaten." });
});

export default router;
