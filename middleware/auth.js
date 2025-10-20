import jwt from "jsonwebtoken";

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
