const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: ['general', 'anxiety', 'depression', 'stress', 'relationships', 'academic', 'success-story'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isAnonymous: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'moderated', 'hidden', 'deleted'],
    default: 'published'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    isAnonymous: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['published', 'moderated', 'hidden', 'deleted'],
      default: 'published'
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  moderatorNotes: {
    type: String,
    maxlength: 500
  },
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en'
  }
}, {
  timestamps: true
});

// Index for efficient queries
forumPostSchema.index({ category: 1, status: 1, createdAt: -1 });
forumPostSchema.index({ author: 1, createdAt: -1 });
forumPostSchema.index({ title: 'text', content: 'text' });
forumPostSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);
