const express = require('express');
const { body, validationResult } = require('express-validator');
const ForumPost = require('../models/ForumPost');
const User = require('../models/User');
const { authenticateToken, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all forum posts with filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status = 'published',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { status };

    // Apply filters
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sorting
    const sortOptions = {};
    if (sortBy === 'pinned') {
      sortOptions.isPinned = -1;
      sortOptions.createdAt = -1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const posts = await ForumPost.find(filter)
      .populate('author', 'firstName lastName role')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ForumPost.countDocuments(filter);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        filters: {
          categories: await ForumPost.distinct('category', { status: 'published' }),
          languages: await ForumPost.distinct('language', { status: 'published' })
        }
      }
    });
  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve forum posts'
    });
  }
});

// Get featured/pinned posts
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const featuredPosts = await ForumPost.find({
      status: 'published',
      $or: [
        { isPinned: true },
        { priority: 'high' }
      ]
    })
    .populate('author', 'firstName lastName role')
    .sort({ isPinned: -1, createdAt: -1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        posts: featuredPosts
      }
    });
  } catch (error) {
    console.error('Get featured posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured posts'
    });
  }
});

// Get post by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'firstName lastName role')
      .populate('comments.author', 'firstName lastName role');

    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve post'
    });
  }
});

// Create new post
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('content').trim().isLength({ min: 1, max: 2000 }),
  body('category').isIn(['general', 'anxiety', 'depression', 'stress', 'relationships', 'academic', 'success-story']),
  body('tags').optional().isArray(),
  body('isAnonymous').optional().isBoolean(),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('language').optional().isIn(['en', 'hi', 'ta', 'te', 'bn'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const postData = {
      ...req.body,
      author: req.user._id,
      status: req.user.role === 'admin' ? 'published' : 'published' // Auto-publish for now
    };

    const post = new ForumPost(postData);
    await post.save();

    await post.populate('author', 'firstName lastName role');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post'
    });
  }
});

// Update post (author or admin/moderator)
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('content').optional().trim().isLength({ min: 1, max: 2000 }),
  body('category').optional().isIn(['general', 'anxiety', 'depression', 'stress', 'relationships', 'academic', 'success-story']),
  body('tags').optional().isArray(),
  body('isAnonymous').optional().isBoolean(),
  body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('status').optional().isIn(['draft', 'published', 'moderated', 'hidden', 'deleted']),
  body('isPinned').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions
    const canEdit = 
      post.author.toString() === req.user._id.toString() ||
      ['admin', 'counselor'].includes(req.user.role);

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update post
    const updates = req.body;
    
    // Only admins can pin posts or change status
    if (req.user.role !== 'admin') {
      delete updates.isPinned;
      if (updates.status && !['draft', 'published'].includes(updates.status)) {
        delete updates.status;
      }
    }

    const updatedPost = await ForumPost.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName role')
     .populate('comments.author', 'firstName lastName role');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: {
        post: updatedPost
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post'
    });
  }
});

// Add comment to post
router.post('/:id/comments', authenticateToken, [
  body('content').trim().isLength({ min: 1, max: 1000 }),
  body('isAnonymous').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = {
      author: req.user._id,
      content: req.body.content,
      isAnonymous: req.body.isAnonymous || true,
      status: req.user.role === 'admin' ? 'published' : 'published'
    };

    post.comments.push(comment);
    await post.save();

    await post.populate('comments.author', 'firstName lastName role');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: newComment
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment'
    });
  }
});

// Like post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked
    const existingLike = post.likes.find(
      like => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      // Unlike
      post.likes = post.likes.filter(
        like => like.user.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      post.likes.push({
        user: req.user._id,
        timestamp: new Date()
      });
    }

    await post.save();

    res.json({
      success: true,
      message: existingLike ? 'Post unliked' : 'Post liked',
      data: {
        likes: post.likes.length,
        userLiked: !existingLike
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post'
    });
  }
});

// Report post
router.post('/:id/report', authenticateToken, [
  body('reason').trim().isLength({ min: 1, max: 200 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post || post.status === 'deleted') {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already reported
    const existingReport = post.reportedBy.find(
      report => report.user.toString() === req.user._id.toString()
    );

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this post'
      });
    }

    post.reportedBy.push({
      user: req.user._id,
      reason: req.body.reason,
      timestamp: new Date()
    });

    await post.save();

    res.json({
      success: true,
      message: 'Post reported successfully'
    });
  } catch (error) {
    console.error('Report post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report post'
    });
  }
});

// Get user's posts
router.get('/my-posts', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { author: req.user._id };
    if (status) filter.status = status;

    const posts = await ForumPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ForumPost.countDocuments(filter);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your posts'
    });
  }
});

// Admin: Get reported posts
router.get('/admin/reported', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await ForumPost.find({
      'reportedBy.0': { $exists: true }
    })
    .populate('author', 'firstName lastName email')
    .populate('reportedBy.user', 'firstName lastName email')
    .sort({ 'reportedBy.timestamp': -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await ForumPost.countDocuments({
      'reportedBy.0': { $exists: true }
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get reported posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reported posts'
    });
  }
});

// Admin: Moderate post
router.post('/:id/moderate', authenticateToken, authorize('admin'), [
  body('action').isIn(['approve', 'hide', 'delete']),
  body('notes').optional().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { action, notes } = req.body;

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    let newStatus;
    switch (action) {
      case 'approve':
        newStatus = 'published';
        break;
      case 'hide':
        newStatus = 'hidden';
        break;
      case 'delete':
        newStatus = 'deleted';
        break;
    }

    post.status = newStatus;
    if (notes) {
      post.moderatorNotes = notes;
    }

    // Clear reports if approved
    if (action === 'approve') {
      post.reportedBy = [];
    }

    await post.save();

    res.json({
      success: true,
      message: `Post ${action}d successfully`,
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Moderate post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate post'
    });
  }
});

// Delete post (author or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check permissions
    const canDelete = 
      post.author.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete
    post.status = 'deleted';
    await post.save();

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post'
    });
  }
});

module.exports = router;
