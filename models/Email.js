import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  images: { type: [String], default: [] }, // <- das ist wichtig
  read: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Email', emailSchema);
