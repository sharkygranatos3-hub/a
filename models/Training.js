import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
  titel: { type: String, required: true },
  inhalt: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const trainingSchema = new mongoose.Schema(
  {
    titel: { type: String, required: true },
    beschreibung: { type: String },
    trainer: { type: String },
    ort: { type: String },
    zeitpunkt: { type: Date },
    maxTeilnehmer: { type: Number },
    zielgruppe: { type: String },
    erforderlicherRang: { type: String },
    teilnehmer: [
      {
        id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        name: String,
        bestanden: { type: Boolean, default: false }
      }
    ],
    module: [moduleSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Training", trainingSchema);
