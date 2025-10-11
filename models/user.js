import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rank: { type: String, default: "Officer" },
  permissions: { type: Object, default: {} },
  active: { type: Boolean, default: true } // für Sperrung
}, { timestamps: true });

export default mongoose.model("User", userSchema);

