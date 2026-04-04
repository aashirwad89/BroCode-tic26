// src/models/TrustedContact.js
import mongoose from 'mongoose';

const trustedContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    name: {
      type: String,
      required: [true, 'Please provide a contact name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
      match: [
        /^[0-9]{10,15}$/,  // ✅ 10-15 digits — country code ke saath bhi kaam karega
        'Please provide a valid phone number (10-15 digits)',
      ],
    },
  },
  {
    timestamps: true,
  }
);

const TrustedContact = mongoose.model('TrustedContact', trustedContactSchema);

export default TrustedContact;