import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  attachment: { type: String, default: null }, // Datei-URL
  date: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

export default mongoose.model("Email", emailSchema);
