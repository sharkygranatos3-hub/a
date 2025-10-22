import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  titel: { type: String, required: true },
  inhalt: { type: String, default: "" }, // HTML/Text
  typ: { type: String, enum: ["text", "video", "pdf"], default: "text" },
  videoUrl: { type: String },
  pdfUrl: { type: String },
});

const trainingSchema = new mongoose.Schema(
  {
    titel: { type: String, required: true },
    beschreibung: { type: String, required: true },
    trainer: { type: String, required: true },
    ort: { type: String },
    datum: { type: String },
    uhrzeit: { type: String },
    maxTeilnehmer: { type: Number, default: 10 },
    zielgruppe: { type: String, default: "Alle Beamten" },
    erforderlicherRang: { type: String, default: "Officer" },
    teilnehmer: [
      {
        mitarbeiterId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        name: String,
        bestanden: { type: Boolean, default: false },
      },
    ],
    module: [moduleSchema],
    erstelltVon: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

export default mongoose.model("Training", trainingSchema);
