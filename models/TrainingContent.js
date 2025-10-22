import mongoose from "mongoose";

const contentModuleSchema = new mongoose.Schema({
  titel: { type: String, required: true },
  inhalt: { type: String, required: true },
});

const trainingContentSchema = new mongoose.Schema({
  titel: { type: String, required: true },
  beschreibung: String,
  erstelltVon: String,
  module: [contentModuleSchema],
  erstelltAm: { type: Date, default: Date.now },
});

export default mongoose.model("TrainingContent", trainingContentSchema);
