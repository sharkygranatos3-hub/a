import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  datum: { type: String, required: true },
  inhalt: { type: String, required: true },
  medien: [String]
});

const investigationSchema = new mongoose.Schema({
  beschuldigter: { type: String, required: true },
  tatvorwurf: { type: String, required: true },
  tatzeit: String,
  tattag: String,
  tatort: String,
  zeugen: String,
  beamte: String,
  aktenzeichen: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  entries: [entrySchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Investigation", investigationSchema);
