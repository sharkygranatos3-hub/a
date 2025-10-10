import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Dummy-Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "12345") {
    const token = jwt.sign({ username }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });
    return res.json({ token });
  }
  res.status(401).json({ error: "Ungültige Anmeldedaten" });
});

export default router;
