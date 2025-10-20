import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  datum: { type: String, required: true },
  inhalt: { type: String, required: true },
  medien: [String],
  createdBy: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String }
  }
});

const investigationSchema = new mongoose.Schema({
  beschuldigter: { type: String, required: true },
  tatvorwurf: { type: String, required: true },
  tattag: String,
  tatzeit: String,
  tatort: String,

  // Arrays statt Strings
  zeugen: [String],
  beamte: [String],

  aktenzeichen: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  eintraege: [entrySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Automatisches Updatedatum
investigationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Investigation", investigationSchema);



