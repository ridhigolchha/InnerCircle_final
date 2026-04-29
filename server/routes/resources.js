const express = require('express');
const { body, validationResult } = require('express-validator');
const Resource = require('../models/Resource');
const User = require('../models/User');
const { authenticateToken, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all resources with filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      type,
      language = 'en',
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { isActive: true, approvalStatus: 'approved' };

    // Apply filters
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (language) filter.language = language;
    if (difficulty) filter.difficultyLevel = difficulty;

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const resources = await Resource.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(filter);

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        filters: {
          categories: await Resource.distinct('category', { isActive: true, approvalStatus: 'approved' }),
          types: await Resource.distinct('type', { isActive: true, approvalStatus: 'approved' }),
          languages: await Resource.distinct('language', { isActive: true, approvalStatus: 'approved' }),
          difficulties: await Resource.distinct('difficultyLevel', { isActive: true, approvalStatus: 'approved' })
        }
      }
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resources'
    });
  }
});

// Get featured resources
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    const featuredResources = await Resource.find({
      isActive: true,
      approvalStatus: 'approved'
    })
    .sort({ views: -1, likes: -1 })
    .limit(6)
    .populate('createdBy', 'firstName lastName');

    res.json({
      success: true,
      data: {
        resources: featuredResources
      }
    });
  } catch (error) {
    console.error('Get featured resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured resources'
    });
  }
});

// Get resource by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('approvedBy', 'firstName lastName');

    if (!resource || !resource.isActive || resource.approvalStatus !== 'approved') {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Increment view count
    resource.views += 1;
    await resource.save();

    res.json({
      success: true,
      data: {
        resource
      }
    });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resource'
    });
  }
});

// Create new resource (authenticated users)
router.post('/', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('description').trim().isLength({ min: 1, max: 1000 }),
  body('type').isIn(['video', 'audio', 'document', 'article', 'exercise', 'meditation']),
  body('category').isIn(['anxiety', 'depression', 'stress', 'relationships', 'academic', 'general']),
  body('language').optional().isIn(['en', 'hi', 'ta', 'te', 'bn']),
  body('tags').optional().isArray(),
  body('targetAudience').optional().isIn(['students', 'counselors', 'volunteers', 'all']),
  body('difficultyLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('content.url').optional().isURL(),
  body('content.duration').optional().isInt({ min: 1 }),
  body('accessibility.hasSubtitles').optional().isBoolean(),
  body('accessibility.hasTranscript').optional().isBoolean(),
  body('accessibility.isAudioDescribed').optional().isBoolean()
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

    const resourceData = {
      ...req.body,
      createdBy: req.user._id,
      approvalStatus: req.user.role === 'admin' ? 'approved' : 'pending'
    };

    const resource = new Resource(resourceData);
    await resource.save();

    await resource.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      data: {
        resource
      }
    });
  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create resource'
    });
  }
});

// Update resource (creator or admin)
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }),
  body('description').optional().trim().isLength({ min: 1, max: 1000 }),
  body('type').optional().isIn(['video', 'audio', 'document', 'article', 'exercise', 'meditation']),
  body('category').optional().isIn(['anxiety', 'depression', 'stress', 'relationships', 'academic', 'general']),
  body('language').optional().isIn(['en', 'hi', 'ta', 'te', 'bn']),
  body('tags').optional().isArray(),
  body('targetAudience').optional().isIn(['students', 'counselors', 'volunteers', 'all']),
  body('difficultyLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('isActive').optional().isBoolean(),
  body('content.url').optional().isURL(),
  body('content.duration').optional().isInt({ min: 1 }),
  body('accessibility.hasSubtitles').optional().isBoolean(),
  body('accessibility.hasTranscript').optional().isBoolean(),
  body('accessibility.isAudioDescribed').optional().isBoolean()
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

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check permissions
    const canEdit = 
      resource.createdBy.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update resource
    const updates = req.body;
    if (req.user.role !== 'admin' && resource.approvalStatus === 'approved') {
      // If resource is approved and user is not admin, reset approval status
      updates.approvalStatus = 'pending';
    }

    const updatedResource = await Resource.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName')
     .populate('approvedBy', 'firstName lastName');

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: {
        resource: updatedResource
      }
    });
  } catch (error) {
    console.error('Update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resource'
    });
  }
});

// Like/Unlike resource
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // For simplicity, we'll just increment likes
    // In a real app, you'd track individual user likes
    resource.likes += 1;
    await resource.save();

    res.json({
      success: true,
      message: 'Resource liked successfully',
      data: {
        likes: resource.likes
      }
    });
  } catch (error) {
    console.error('Like resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like resource'
    });
  }
});

// Download resource (track downloads)
router.post('/:id/download', authenticateToken, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource || !resource.isActive || !resource.content.url) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found or not downloadable'
      });
    }

    // Increment download count
    resource.downloads += 1;
    await resource.save();

    res.json({
      success: true,
      message: 'Download initiated',
      data: {
        downloadUrl: resource.content.url,
        downloads: resource.downloads
      }
    });
  } catch (error) {
    console.error('Download resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate download'
    });
  }
});

// Get user's created resources
router.get('/my-resources', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { createdBy: req.user._id };
    if (status) filter.approvalStatus = status;

    const resources = await Resource.find(filter)
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments(filter);

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get my resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your resources'
    });
  }
});

// Admin: Get pending resources for approval
router.get('/admin/pending', authenticateToken, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const resources = await Resource.find({ approvalStatus: 'pending' })
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Resource.countDocuments({ approvalStatus: 'pending' });

    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get pending resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending resources'
    });
  }
});

// Admin: Approve/Reject resource
router.post('/:id/approve', authenticateToken, authorize('admin'), [
  body('action').isIn(['approve', 'reject']),
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

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resource.approvalStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Resource is not pending approval'
      });
    }

    resource.approvalStatus = action;
    resource.approvedBy = req.user._id;
    
    if (action === 'reject') {
      resource.isActive = false;
    }

    if (notes) {
      resource.moderatorNotes = notes;
    }

    await resource.save();

    res.json({
      success: true,
      message: `Resource ${action}d successfully`,
      data: {
        resource
      }
    });
  } catch (error) {
    console.error('Approve resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process resource approval'
    });
  }
});

// Delete resource (creator or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check permissions
    const canDelete = 
      resource.createdBy.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Resource.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resource'
    });
  }
});

module.exports = router;
