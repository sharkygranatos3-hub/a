const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  title: String,
  content: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', NoteSchema);
