import jwt from "jsonwebtoken";

// Token-Prüfung (wie bisher)
export default function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ msg: "Kein Token, Zugriff verweigert" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "Kein Token gefunden" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded._id,
      name: decoded.name,
      username: decoded.username,
      rank: decoded.rank
    };
    next();
  } catch (err) {
    console.error("Token ungültig:", err);
    res.status(401).json({ msg: "Token ungültig" });
  }
}

// Zusätzliche Middleware für Rollenprüfung (NEU)
export function requireRole(...roles) {
  return (req, res, next) => {
    try {
      if (!req.user || !roles.includes(req.user.rank)) {
        return res.status(403).json({ msg: "Keine Berechtigung" });
      }
      next();
    } catch (err) {
      console.error("Fehler bei Rollenprüfung:", err);
      res.status(500).json({ msg: "Serverfehler bei Rollenprüfung" });
    }
  };
}
