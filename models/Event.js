import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: String, required: true },  // ISO-Format YYYY-MM-DD
  end: { type: String, required: true },
  type: { type: String, enum: ["public", "private", "group"], default: "public" },
  group: { type: String, default: "" },
  desc: { type: String, default: "" },
  owner: { type: String, required: true }, // Benutzer-ID oder Name
  ownerName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Event", eventSchema);
