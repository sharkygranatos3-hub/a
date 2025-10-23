import mongoose from "mongoose";

const wikiEntrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorName: { type: String },
  authorRank: { type: String },
}, { timestamps: true });

export default mongoose.model("WikiEntry", wikiEntrySchema);
