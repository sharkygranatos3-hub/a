import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  datum: { type: String, required: true },
  inhalt: { type: String, required: true },
  medien: [String]
});

const investigationSchema = new mongoose.Schema({
  beschuldigter: { type: String, required: true },
  tatvorwurf: { type: String, required: true },
  tattag: String,
  tatzeit: String,
  tatort: String,
  zeugen: String,
  beamte: String,
  aktenzeichen: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // alle Einträge in der Akte (z. B. Berichte, Zeugenbefragungen etc.)
  eintraege: [entrySchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Datum automatisch aktualisieren, wenn sich etwas ändert
investigationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Investigation", investigationSchema);
