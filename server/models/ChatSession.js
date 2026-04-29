const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      confidence: Number,
      suggestedActions: [String],
      emergencyDetected: Boolean,
      referralSuggested: Boolean
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'escalated', 'closed'],
    default: 'active'
  },
  emergencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  topics: [{
    type: String,
    trim: true
  }],
  mood: {
    type: String,
    enum: ['very-low', 'low', 'neutral', 'good', 'very-good']
  },
  riskAssessment: {
    hasSuicidalThoughts: { type: Boolean, default: false },
    hasSelfHarm: { type: Boolean, default: false },
    hasSubstanceAbuse: { type: Boolean, default: false },
    hasViolence: { type: Boolean, default: false },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    }
  },
  interventions: [{
    type: {
      type: String,
      enum: ['breathing-exercise', 'grounding-technique', 'positive-affirmation', 'resource-suggestion', 'professional-referral']
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    effectiveness: {
      type: String,
      enum: ['not-applicable', 'not-helpful', 'somewhat-helpful', 'helpful', 'very-helpful']
    }
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  counselorNotified: {
    type: Boolean,
    default: false
  },
  counselor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionDuration: {
    type: Number, // in minutes
    default: 0
  },
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSessionSchema.index({ user: 1, createdAt: -1 });
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ status: 1, emergencyLevel: 1 });
chatSessionSchema.index({ followUpRequired: 1, followUpDate: 1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
