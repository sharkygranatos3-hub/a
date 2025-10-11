import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js"; // Pfad zu deinem User-Model prüfen

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function createChief() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Mit MongoDB verbunden");

    const username = "LSPD-MM-001";
    const password = "Passwort123"; // temporäres Passwort
    const hashedPassword = await bcrypt.hash(password, 10);

    // Alten Chief löschen
    await User.deleteOne({ username });
    console.log("⏹ Alter Chief gelöscht (falls vorhanden)");

    // Neuen Chief erstellen
    const chief = new User({
      username,
      password: hashedPassword,
      rank: "Chief",
      active: true,
      permissions: {
        manageEmployees: true,
        manageCases: true,
        assignTrainings: true
      }
    });

    await chief.save();
    console.log("✅ Neuer Chief erstellt!");
    console.log(`Benutzername: ${username}`);
    console.log(`Passwort: ${password} (temporär, beim ersten Login ändern!)`);

    process.exit(0);
  } catch (err) {
    console.error("❌ Fehler:", err);
    process.exit(1);
  }
}

createChief();
