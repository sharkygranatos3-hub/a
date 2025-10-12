import mongoose from "mongoose";

// 🔹 Unter-Schema für Personalakte-Einträge
const entrySchema = new mongoose.Schema({
  type: { type: String, required: true }, // z. B. "Positiver Eintrag", "Beförderung"
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
}, { _id: false });

// 🔹 Unter-Schema für Dateianhänge in E-Mails
const attachmentSchema = new mongoose.Schema({
  filename: String,          // Ursprünglicher Dateiname
  storedFilename: String,    // Gespeicherter Dateiname auf dem Server
  url: String,               // Download-URL
  size: Number,              // Dateigröße in Bytes
  mimetype: String           // MIME-Typ (z. B. image/png, application/pdf)
}, { _id: false });

// 🔹 Unter-Schema für E-Mails
const emailSchema = new mongoose.Schema({
  from: String,
  to: String,
  subject: String,
  body: String,
  date: { type: Date, default: Date.now },
  sent: { type: Boolean, default: false }, // true = gesendet, false = empfangen
  attachments: { type: [attachmentSchema], default: [] }
}, { timestamps: true });

// 🔹 Hauptschema für Benutzer
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

  // 🔽 Personalakte
  entries: { type: [entrySchema], default: [] },

  // 🔽 E-Mails
  emails: { type: [emailSchema], default: [] }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
