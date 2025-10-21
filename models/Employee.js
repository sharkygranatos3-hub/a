// models/Employee.js
import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  rank: String,
  username: String,
  password: String, // hashed mit bcrypt
  securityLevel: Number,
  trainings: [{ name: String, done: Boolean, date: Date }],
  active: { type: Boolean, default: true }
});

export default mongoose.model("users", EmployeeSchema);

