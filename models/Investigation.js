import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  datum: { type: String, required: true },
  inhalt: { type: String, required: true },
  medien: [String],
  createdBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String }
  }
});

const investigationSchema = new mongoose.Schema({
  beschuldigter: { type: String, required: true },
  tatvorwurf: { type: String, required: true },
  tattag: String,
  tatzeit: String,
  tatort: String,

  zeugen: [String],
  beamte: [String],

  aktenzeichen: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  eintraege: [entrySchema],

  // Neue Felder
  status: { type: String, default: "Offen" }, // "Offen", "PD Prüfen", "DoJ Prüfen"
  urgent: { type: Boolean, default: false },
  archived: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

investigationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Investigation", investigationSchema);
