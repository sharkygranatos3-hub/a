// models/Investigation.js
import mongoose from "mongoose";

const investigationSchema = new mongoose.Schema({
  beschuldigter: { type: String, required: true },
  tatvorwurf: { type: String, required: true },
  tattag: { type: String },
  tatzeit: { type: String },
  tatort: { type: String },
  zeugen: [{ type: String }],
  beamte: [{ type: String }],
  aktenzeichen: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Investigation", investigationSchema);
