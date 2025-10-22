import mongoose from "mongoose";

const TrainingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  trainer: String,
  location: String,
  datetime: Date,
  maxParticipants: Number,
  targetGroup: String,
  requiredRank: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }]
}, { timestamps: true });

export default mongoose.model("Training", TrainingSchema);
