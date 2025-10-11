import express from "express";
const router = express.Router();

// Beispiel-Login (später mit DB ersetzen)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Test-Login
  if (username === "admin" && password === "12345") {
    return res.json({
      token: "dummy-token-admin",
      rank: "Chief",
      username: "admin"
    });
  } else {
    return res.status(401).json({ message: "Ungültige Anmeldedaten." });
  }
});

export default router;
