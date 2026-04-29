const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Resource = require('../models/Resource');
const ForumPost = require('../models/ForumPost');
const ChatSession = require('../models/ChatSession');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin authentication
router.use(authenticateToken);
router.use(authorize('admin'));

// Dashboard overview statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalCounselors,
      totalAppointments,
      totalResources,
      totalForumPosts,
      totalChatSessions,
      recentUsers,
      recentAppointments,
      recentChatSessions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'counselor' }),
      Appointment.countDocuments(),
      Resource.countDocuments(),
      ForumPost.countDocuments(),
      ChatSession.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email role createdAt'),
      Appointment.find().populate('student counselor', 'firstName lastName').sort({ createdAt: -1 }).limit(5),
      ChatSession.find().populate('user', 'firstName lastName').sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate appointment statistics
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate resource statistics
    const resourceStats = await Resource.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate forum statistics
    const forumStats = await ForumPost.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate chat session statistics
    const chatStats = await ChatSession.aggregate([
      {
        $group: {
          _id: '$emergencyLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalStudents,
          totalCounselors,
          totalAppointments,
          totalResources,
          totalForumPosts,
          totalChatSessions
        },
        appointmentStats,
        resourceStats,
        forumStats,
        chatStats,
        recent: {
          users: recentUsers,
          appointments: recentAppointments,
          chatSessions: recentChatSessions
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data'
    });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
});

// Update user status
router.put('/users/:id', [
  body('isActive').optional().isBoolean(),
  body('role').optional().isIn(['student', 'counselor', 'admin', 'volunteer'])
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

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updates = {};
    if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;
    if (req.body.role !== undefined) updates.role = req.body.role;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Analytics - User registration trends
router.get('/analytics/users', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          students: {
            $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
          },
          counselors: {
            $sum: { $cond: [{ $eq: ['$role', 'counselor'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        trends: userTrends
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user analytics'
    });
  }
});

// Analytics - Appointment trends
router.get('/analytics/appointments', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const appointmentTrends = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          emergency: {
            $sum: { $cond: [{ $eq: ['$emergencyLevel', 'critical'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Appointment type distribution
    const appointmentTypes = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: '$appointmentType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        trends: appointmentTrends,
        types: appointmentTypes
      }
    });
  } catch (error) {
    console.error('Appointment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointment analytics'
    });
  }
});

// Analytics - Chat session insights
router.get('/analytics/chat', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateFilter;
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const chatInsights = await ChatSession.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          averageDuration: { $avg: '$sessionDuration' },
          totalMessages: { $sum: { $size: '$messages' } },
          emergencySessions: {
            $sum: { $cond: [{ $in: ['$emergencyLevel', ['high', 'critical']] }, 1, 0] }
          },
          followUpRequired: {
            $sum: { $cond: ['$followUpRequired', 1, 0] }
          }
        }
      }
    ]);

    // Topic analysis
    const topicAnalysis = await ChatSession.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter },
          topics: { $exists: true, $ne: [] }
        }
      },
      {
        $unwind: '$topics'
      },
      {
        $group: {
          _id: '$topics',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Risk level distribution
    const riskDistribution = await ChatSession.aggregate([
      {
        $match: {
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: '$emergencyLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        insights: chatInsights[0] || {},
        topics: topicAnalysis,
        riskDistribution
      }
    });
  } catch (error) {
    console.error('Chat analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat analytics'
    });
  }
});

// Analytics - Resource usage
router.get('/analytics/resources', async (req, res) => {
  try {
    const resourceUsage = await Resource.aggregate([
      {
        $group: {
          _id: '$category',
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          totalDownloads: { $sum: '$downloads' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { totalViews: -1 }
      }
    ]);

    const typeDistribution = await Resource.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    const languageDistribution = await Resource.aggregate([
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        categoryUsage: resourceUsage,
        typeDistribution,
        languageDistribution
      }
    });
  } catch (error) {
    console.error('Resource analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resource analytics'
    });
  }
});

// Analytics - Forum activity
router.get('/analytics/forum', async (req, res) => {
  try {
    const forumActivity = await ForumPost.aggregate([
      {
        $group: {
          _id: '$category',
          totalPosts: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } },
          totalComments: { $sum: { $size: '$comments' } }
        }
      },
      {
        $sort: { totalPosts: -1 }
      }
    ]);

    const recentActivity = await ForumPost.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          posts: { $sum: 1 },
          comments: { $sum: { $size: '$comments' } }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        categoryActivity: forumActivity,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Forum analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve forum analytics'
    });
  }
});

// Export data (anonymized)
router.get('/export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let data;
    let filename;

    switch (type) {
      case 'users':
        data = await User.find(filter).select('-password -email');
        filename = 'users_export.json';
        break;
      case 'appointments':
        data = await Appointment.find(filter)
          .populate('student', 'firstName lastName')
          .populate('counselor', 'firstName lastName');
        filename = 'appointments_export.json';
        break;
      case 'chat-sessions':
        data = await ChatSession.find(filter)
          .populate('user', 'firstName lastName')
          .select('-messages'); // Exclude actual messages for privacy
        filename = 'chat_sessions_export.json';
        break;
      case 'resources':
        data = await Resource.find(filter)
          .populate('createdBy', 'firstName lastName');
        filename = 'resources_export.json';
        break;
      case 'forum-posts':
        data = await ForumPost.find(filter)
          .populate('author', 'firstName lastName');
        filename = 'forum_posts_export.json';
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.json({
      success: true,
      data: {
        exportType: type,
        recordCount: data.length,
        exportDate: new Date().toISOString(),
        data
      }
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data'
    });
  }
});

module.exports = router;
