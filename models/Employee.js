const mongoose = require('mongoose');

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

module.exports = mongoose.model('Employee', EmployeeSchema);
