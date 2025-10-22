import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  titel: String,
  inhalt: String,
});

const teilnehmerSchema = new mongoose.Schema({
  username: String,
  name: String,
  bestanden: { type: Boolean, default: false },
});

const trainingSchema = new mongoose.Schema({
  titel: String,
  beschreibung: String,
  trainer: String,
  ort: String,
  zeitpunkt: Date,
  erstelltVon: String,
  teilnehmer: [teilnehmerSchema],
  module: [moduleSchema],
});

export default mongoose.model("Training", trainingSchema);
