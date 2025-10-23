import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: String, required: true },
  end: { type: String, required: true },
  type: { type: String, enum: ["public", "private", "group"], default: "public" },
  group: { type: String },
  desc: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerName: { type: String, required: true },
  ownerRank: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Event", eventSchema);
