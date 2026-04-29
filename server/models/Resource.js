const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['video', 'audio', 'document', 'article', 'exercise', 'meditation'],
    required: true
  },
  category: {
    type: String,
    enum: ['anxiety', 'depression', 'stress', 'relationships', 'academic', 'general'],
    required: true
  },
  language: {
    type: String,
    default: 'en',
    required: true
  },
  content: {
    url: String,
    duration: Number, // for audio/video in minutes
    fileSize: Number,
    thumbnail: String
  },
  tags: [{
    type: String,
    trim: true
  }],
  targetAudience: {
    type: String,
    enum: ['students', 'counselors', 'volunteers', 'all'],
    default: 'students'
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  accessibility: {
    hasSubtitles: { type: Boolean, default: false },
    hasTranscript: { type: Boolean, default: false },
    isAudioDescribed: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Index for efficient searches
resourceSchema.index({ category: 1, language: 1, isActive: 1 });
resourceSchema.index({ tags: 1 });
resourceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
