import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  titel: { type: String, required: true },
  inhalt: { type: String }, // HTML oder Quill-Inhalt
  medien: [String], // URLs zu Bildern/Videos/PDF
});

const contentSchema = new mongoose.Schema({
  titel: { type: String, required: true },
  beschreibung: { type: String }, // allgemeine Beschreibung
  modules: [moduleSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Content", contentSchema);
