import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Mit MongoDB verbunden");

    // Passwort hashen
    const hashedPassword = await bcrypt.hash("Passwort123", 10);

    // Chief-User anlegen oder updaten
    const chief = await User.findOneAndUpdate(
      { username: "LSPD-MM-001" },
      {
        vorname: "Max",
        nachname: "Mustermann",
        username: "LSPD-MM-001",
        password: hashedPassword,
        rang: "Chief",
        securityLevel: 10,
        dienstnummer: "C-001",
        active: true
      },
      { upsert: true, new: true }
    );

    console.log("✅ Chief-User erstellt oder aktualisiert:", chief);

    await mongoose.disconnect();
    console.log("🔌 Verbindung getrennt");
  } catch (err) {
    console.error(err);
  }
};

run();
