// models/WikiEntry.js
import mongoose from "mongoose";

const wikiEntrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true }, // z. B. "John Doe"
}, { timestamps: true });

export default mongoose.model("WikiEntry", wikiEntrySchema);
