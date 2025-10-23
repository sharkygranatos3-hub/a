import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  name: String,
  userId: String
});

const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  trainer: { type: String },
  content: { type: String },
  maxParticipants: { type: Number, default: 10 },
  participants: [participantSchema],
  sortOrder: { type: Number, default: 999 }, // NEU: Sortier-Reihenfolge
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Training", trainingSchema);
