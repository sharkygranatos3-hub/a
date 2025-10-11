import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  vorname: String,
  nachname: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Officer" },
  rang: { type: String, default: "Officer" },
  securityLevel: { type: Number, default: 1 },
  dienstnummer: { type: String, default: "" },
  ausbildungen: { type: Array, default: [] },
  active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("User", userSchema, "users");
