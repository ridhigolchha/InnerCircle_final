const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentType: {
    type: String,
    enum: ['individual', 'group', 'emergency', 'follow-up'],
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 60, // minutes
    required: true
  },
  location: {
    type: String,
    enum: ['office', 'online', 'phone'],
    default: 'office'
  },
  meetingLink: {
    type: String
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  studentNotes: {
    type: String,
    maxlength: 500
  },
  counselorNotes: {
    type: String,
    maxlength: 1000
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  emergencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  confidentialityLevel: {
    type: String,
    enum: ['standard', 'high', 'strict'],
    default: 'standard'
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ student: 1, scheduledDate: 1 });
appointmentSchema.index({ counselor: 1, scheduledDate: 1 });
appointmentSchema.index({ status: 1, scheduledDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
