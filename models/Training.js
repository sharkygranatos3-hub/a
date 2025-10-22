// models/Training.js
import mongoose from "mongoose";


const participantSchema = new mongoose.Schema({
username: { type: String, required: true },
name: String,
status: { type: String, enum: ["registered","completed","passed","failed"], default: "registered" },
registeredAt: { type: Date, default: Date.now }
}, { _id: false });


const trainingSchema = new mongoose.Schema({
title: { type: String, required: true },
description: { type: String, default: "" }, // HTML (Quill)
trainer: { type: String, default: "" }, // trainer username
trainerName: { type: String, default: "" }, // optional display name
datetime: { type: Date },
maxParticipants: { type: Number, default: 20 },
target: { type: String, default: "All" },
participants: { type: [participantSchema], default: [] },
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
createdAt: { type: Date, default: Date.now },
updatedAt: { type: Date, default: Date.now }
});


trainingSchema.pre("save", function(next){
this.updatedAt = new Date();
next();
});


const Training = mongoose.models.Training || mongoose.model("Training", trainingSchema);
export default Training;
