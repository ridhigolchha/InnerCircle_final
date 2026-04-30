const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { optionalAuth, authenticateToken } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

const router = express.Router();

// In-memory session store for when MongoDB is unavailable
const memorySessions = new Map();

// Helper to check if MongoDB is connected
const isDbConnected = () => mongoose.connection.readyState === 1;

// Helper to get or create session
const getSession = async (sessionId) => {
  if (isDbConnected()) {
    const ChatSession = require('../models/ChatSession');
    return await ChatSession.findOne({ sessionId });
  }
  return memorySessions.get(sessionId) || null;
};

// Start new chat session
router.post('/start', optionalAuth, async (req, res) => {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const welcomeMessage = {
      role: 'assistant',
      content: "Hello! I'm here to provide emotional support and coping strategies. How are you feeling today? You can share what's on your mind, and I'll do my best to help.",
      timestamp: new Date(),
      metadata: {
        confidence: 1.0,
        suggestedActions: ['share-feelings', 'ask-for-help', 'get-resources'],
        emergencyDetected: false,
        referralSuggested: false
      }
    };

    if (isDbConnected()) {
      const ChatSession = require('../models/ChatSession');
      const session = new ChatSession({
        user: req.user ? req.user._id : null,
        sessionId,
        status: 'active'
      });
      session.messages.push(welcomeMessage);
      await session.save();
    } else {
      // Store in memory as fallback
      memorySessions.set(sessionId, {
        sessionId,
        user: null,
        status: 'active',
        messages: [welcomeMessage],
        topics: [],
        mood: 'neutral',
        emergencyLevel: 'low',
        interventions: [],
        riskAssessment: { riskLevel: 'low' },
        followUpRequired: false
      });
    }

    res.json({
      success: true,
      data: {
        sessionId,
        message: welcomeMessage
      }
    });
  } catch (error) {
    console.error('Chat start error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat session'
    });
  }
});

// Send message to chat
router.post('/message', [
  body('sessionId').notEmpty(),
  body('message').trim().isLength({ min: 1, max: 1000 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId, message } = req.body;

    // Find chat session (DB or memory)
    let session;
    let isMemorySession = false;

    if (isDbConnected()) {
      const ChatSession = require('../models/ChatSession');
      session = await ChatSession.findOne({ sessionId });
    }

    if (!session) {
      session = memorySessions.get(sessionId);
      isMemorySession = true;
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    if (session.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Chat session is not active'
      });
    }

    // Add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    session.messages.push(userMessage);

    // Prepare context for AI
    const userContext = {
      userId: req.user ? req.user._id?.toString() : 'anonymous',
      role: req.user ? req.user.role : 'anonymous',
      sessionDuration: session.messages.length,
      previousTopics: session.topics || []
    };

    // Get AI response
    const aiResponse = await geminiService.generateResponse(
      session.messages.slice(-10),
      userContext
    );

    // Run analysis in parallel for better performance
    let riskAnalysis = { riskLevel: 'low', indicators: [], recommendations: [] };
    let interventions = { interventions: [] };
    let topics = [];
    let moodAssessment = { mood: 'neutral', confidence: 0.5, reasoning: 'Default' };

    try {
      [riskAnalysis, interventions, topics, moodAssessment] = await Promise.all([
        geminiService.analyzeRiskLevel(session.messages.slice(-5)),
        geminiService.suggestInterventions(message, { riskLevel: 'low', sessionHistory: session.messages.length }),
        geminiService.extractTopics(session.messages.slice(-5)),
        geminiService.assessMood(session.messages.slice(-3))
      ]);
    } catch (analysisError) {
      console.error('AI analysis error (non-fatal):', analysisError.message);
    }

    // Add AI response
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
      metadata: {
        confidence: 0.8,
        suggestedActions: (interventions.interventions || []).map(i => i.type),
        emergencyDetected: riskAnalysis.riskLevel === 'critical' || riskAnalysis.riskLevel === 'high',
        referralSuggested: (riskAnalysis.recommendations || []).includes('professional-referral')
      }
    };

    session.messages.push(assistantMessage);

    // Update session data
    session.emergencyLevel = riskAnalysis.riskLevel;
    session.topics = [...new Set([...(session.topics || []), ...(topics || [])])];
    session.mood = moodAssessment.mood;

    if (riskAnalysis.riskLevel === 'critical' || riskAnalysis.riskLevel === 'high') {
      if (session.riskAssessment) {
        session.riskAssessment.riskLevel = riskAnalysis.riskLevel;
      }
      session.followUpRequired = true;
    }

    // Save session
    if (isMemorySession) {
      memorySessions.set(sessionId, session);
    } else {
      try {
        // Add interventions
        (interventions.interventions || []).forEach(intervention => {
          session.interventions.push({
            type: intervention.type,
            content: intervention.description,
            timestamp: new Date()
          });
        });
        await session.save();
      } catch (saveErr) {
        console.error('Session save error (non-fatal):', saveErr.message);
      }
    }

    res.json({
      success: true,
      data: {
        message: assistantMessage,
        riskLevel: riskAnalysis.riskLevel,
        suggestedInterventions: interventions.interventions || [],
        mood: moodAssessment.mood,
        topics: topics || [],
        emergencyResources: riskAnalysis.riskLevel === 'critical' || riskAnalysis.riskLevel === 'high' ? {
          crisisHotline: '988',
          campusCounseling: 'Available 24/7',
          emergencyServices: '911'
        } : null
      }
    });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

// Get chat session history
router.get('/session/:sessionId', optionalAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    let session = null;
    if (isDbConnected()) {
      const ChatSession = require('../models/ChatSession');
      session = await ChatSession.findOne({ sessionId });
    }
    if (!session) {
      session = memorySessions.get(sessionId) || null;
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: { session }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session'
    });
  }
});

// End chat session
router.post('/end', [
  body('sessionId').notEmpty(),
  body('satisfaction.rating').optional().isInt({ min: 1, max: 5 }),
  body('satisfaction.feedback').optional().isLength({ max: 500 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId, satisfaction } = req.body;

    let session = null;
    let isMemorySession = false;

    if (isDbConnected()) {
      const ChatSession = require('../models/ChatSession');
      session = await ChatSession.findOne({ sessionId });
    }
    if (!session) {
      session = memorySessions.get(sessionId);
      isMemorySession = true;
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    session.status = 'completed';

    if (isMemorySession) {
      memorySessions.delete(sessionId);
    } else {
      session.sessionDuration = Math.round((new Date() - session.createdAt) / (1000 * 60));
      if (satisfaction) {
        session.satisfaction = satisfaction;
      }
      await session.save();
    }

    res.json({
      success: true,
      message: 'Chat session ended successfully',
      data: {
        sessionDuration: session.sessionDuration || 0,
        messagesCount: session.messages.length,
        topics: session.topics || [],
        interventionsUsed: (session.interventions || []).length
      }
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end session'
    });
  }
});

// Get user's chat history (for authenticated users)
router.get('/history', authenticateToken, async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json({
        success: true,
        data: { sessions: [], pagination: { current: 1, pages: 0, total: 0 } }
      });
    }

    const ChatSession = require('../models/ChatSession');
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const sessions = await ChatSession.find({ user: req.user._id })
      .select('sessionId status createdAt sessionDuration topics mood emergencyLevel')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ChatSession.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chat history'
    });
  }
});

// Get crisis resources
router.get('/crisis-resources', (req, res) => {
  const resources = {
    emergency: {
      nationalCrisisHotline: '988',
      emergencyServices: '911',
      textCrisis: 'Text HOME to 741741'
    },
    campus: {
      counselingCenter: 'Available 24/7',
      healthServices: 'Student Health Center',
      emergencyContact: 'Campus Security'
    },
    online: {
      crisisChat: 'Crisis Text Line',
      suicidePrevention: 'National Suicide Prevention Lifeline',
      mentalHealthResources: 'SAMHSA National Helpline'
    }
  };

  res.json({
    success: true,
    data: resources
  });
});

module.exports = router;
