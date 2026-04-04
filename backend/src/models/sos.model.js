// src/models/sos.model.js
import mongoose from 'mongoose';

const SOSLogSchema = new mongoose.Schema(
  {
    latitude:         { type: Number, required: true },
    longitude:        { type: Number, required: true },
    audioPath:        { type: String },
    contactsNotified: [{ type: String }],
    triggeredAt:      { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('SOSLog', SOSLogSchema); // ✅ export default