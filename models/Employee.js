import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  rank: String,
  username: String,
  password: String, // Passwort als Hash
  securityLevel: Number,
  trainings: [{ name: String, done: Boolean, date: Date }],
  active: { type: Boolean, default: true }
}, { collection: "users" }); // 🔹 Force Collection "users"

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);
