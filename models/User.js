import mongoose from "mongoose";

// Unter-Schema für Personalakte-Einträge
const entrySchema = new mongoose.Schema({
  type: { type: String, required: true }, // z. B. "Positiver Eintrag", "Beförderung"
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
}, { _id: false }); // kein separates Mongo-ID-Feld für jeden Eintrag

const userSchema = new mongoose.Schema({
  vorname: { type: String, required: true },
  nachname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rang: { type: String, default: "Officer" },
  role: { type: String, default: "Officer" },
  securityLevel: { type: Number, default: 1 },
  dienstnummer: { type: String, default: "" },
  ausbildungen: { type: Array, default: [] },
  active: { type: Boolean, default: true },

  // 🔽 Neues Feld für Personalakte-Einträge
  entries: { type: [entrySchema], default: [] }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
