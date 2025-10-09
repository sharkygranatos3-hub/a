const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: String,
  phone: String,
  fileNumber: String,
  fingerprint: String,
  activeSearch: Boolean,
  image: { type: String, default: 'https://e7.pngegg.com/pngimages/53/221/png-clipart-computer-icons-scalable-graphics-customers-icon-head-silhouette.png' },
  log: [{ action: String, date: Date, user: String }]
});

module.exports = mongoose.model('File', FileSchema);
