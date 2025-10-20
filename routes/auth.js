import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !user.comparePassword(password)) {
      return res.status(400).json({ message: "Ungültige Anmeldedaten." });
    }

    // Token erstellen – jetzt inkl. _id, Name, Username, Rank
    const token = jwt.sign(
      { 
        _id: user._id,
        name: `${user.vorname} ${user.nachname}`,
        username: user.username,
        rank: user.rang
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // 1 Tag gültig
    );

    res.json({ token, rank: user.rang });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: "Serverfehler" });
  }
};
