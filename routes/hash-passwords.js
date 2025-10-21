// hash-passwords.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Employee Model
import Employee from "./models/Employee.js"; // passt zu deiner Datei

async function hashPasswords() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("✅ Mit MongoDB verbunden");

    const users = await Employee.find({});
    console.log(`🔹 ${users.length} User gefunden`);

    for (const user of users) {
      // Prüfen, ob Passwort schon gehasht ist (typischer bcrypt Hash beginnt mit $2a$)
      if (!user.password.startsWith("$2")) {
        const hashed = await bcrypt.hash(user.password, 10);
        user.password = hashed;
        await user.save();
        console.log(`✅ Passwort gehasht für ${user.username}`);
      } else {
        console.log(`ℹ️ Passwort bereits gehasht: ${user.username}`);
      }
    }

    console.log("🎉 Alle Passwörter gehasht!");
    mongoose.disconnect();
  } catch (err) {
    console.error(err);
    mongoose.disconnect();
  }
}

hashPasswords();
