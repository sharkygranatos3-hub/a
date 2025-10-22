import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  titel: String,
  inhalt: String, // HTML/Text
  medien: [String], // Links zu Videos/Bildern
});

const trainingSchema = new mongoose.Schema({
  titel: { type: String, required: true },
  beschreibung: String,
  trainer: String,
  ort: String,
  datum: String,
  maxTeilnehmer: Number,
  zielgruppe: String,
  erforderlichRang: String,
  teilnehmer: [
    {
      id: String,
      name: String,
      username: String,
      bestanden: { type: Boolean, default: false },
    },
  ],
  module: [moduleSchema],
});

export default mongoose.model("Training", trainingSchema);
