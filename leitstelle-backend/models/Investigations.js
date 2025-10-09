const mongoose = require('mongoose');

const InvestigationSchema = new mongoose.Schema({
  fileNumber: String,
  caseNumber: String,
  date: { type: Date, default: Date.now },
  officers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  witnesses: [String],
  suspects: [String],
  entries: [{ type: String, date: Date }]
});

module.exports = mongoose.model('Investigation', InvestigationSchema);
