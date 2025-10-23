import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startDate: { type: String, required: true }, // YYYY-MM-DD
  endDate: { type: String, required: true },   // YYYY-MM-DD
  type: { type: String, enum: ['public','private','group'], default: 'public' },
  group: { type: String, default: '' },
  description: { type: String, default: '' },
  createdBy: { type: String, required: true }, // Name des Erstellers
  creatorId: { type: String, required: true }, // ID des Erstellers
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
