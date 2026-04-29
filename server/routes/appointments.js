const express = require('express');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { authenticateToken, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// Get available counselors
router.get('/counselors', authenticateToken, async (req, res) => {
  try {
    const counselors = await User.find({ 
      role: 'counselor',
      isActive: true 
    }).select('firstName lastName email phone preferences');

    res.json({
      success: true,
      data: {
        counselors
      }
    });
  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve counselors'
    });
  }
});

// Get counselor availability
router.get('/availability/:counselorId', authenticateToken, async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { date, duration = 60 } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get existing appointments for the counselor on the specified date
    const existingAppointments = await Appointment.find({
      counselor: counselorId,
      scheduledDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $in: ['scheduled', 'confirmed'] }
    }).select('scheduledDate duration');

    // Generate available time slots (9 AM to 5 PM, 1-hour slots)
    const availableSlots = [];
    const startHour = 9;
    const endHour = 17;

    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, 0, 0, 0);
      
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + parseInt(duration));

      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.scheduledDate);
        const appointmentEnd = new Date(appointmentStart);
        appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointment.duration);

        return (slotStart < appointmentEnd && slotEnd > appointmentStart);
      });

      if (!hasConflict && slotStart > new Date()) {
        availableSlots.push({
          start: slotStart,
          end: slotEnd,
          available: true
        });
      }
    }

    res.json({
      success: true,
      data: {
        counselorId,
        date: targetDate.toISOString().split('T')[0],
        availableSlots
      }
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve availability'
    });
  }
});

// Book appointment
router.post('/book', authenticateToken, [
  body('counselorId').isMongoId(),
  body('scheduledDate').isISO8601(),
  body('duration').isInt({ min: 30, max: 120 }),
  body('appointmentType').isIn(['individual', 'group', 'emergency', 'follow-up']),
  body('location').optional().isIn(['office', 'online', 'phone']),
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

    const {
      counselorId,
      scheduledDate,
      duration,
      appointmentType,
      location = 'office',
      notes,
      emergencyLevel = 'low'
    } = req.body;

    // Verify counselor exists and is active
    const counselor = await User.findById(counselorId);
    if (!counselor || counselor.role !== 'counselor' || !counselor.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid counselor selected'
      });
    }

    // Check for conflicts
    const appointmentStart = new Date(scheduledDate);
    const appointmentEnd = new Date(appointmentStart);
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + duration);

    const conflict = await Appointment.findOne({
      counselor: counselorId,
      scheduledDate: {
        $gte: appointmentStart,
        $lt: appointmentEnd
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is no longer available'
      });
    }

    // Create appointment
    const appointment = new Appointment({
      student: req.user._id,
      counselor: counselorId,
      scheduledDate: appointmentStart,
      duration,
      appointmentType,
      location,
      studentNotes: notes,
      emergencyLevel,
      confidentialityLevel: emergencyLevel === 'critical' ? 'strict' : 'standard'
    });

    await appointment.save();

    // Populate counselor details for response
    await appointment.populate('counselor', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment'
    });
  }
});

// Get user's appointments
router.get('/my-appointments', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { student: req.user._id };
    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('counselor', 'firstName lastName email phone')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments'
    });
  }
});

// Get appointment details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('counselor', 'firstName lastName email phone');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    const hasAccess = 
      appointment.student._id.toString() === req.user._id.toString() ||
      appointment.counselor._id.toString() === req.user._id.toString() ||
      ['admin', 'counselor'].includes(req.user.role);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: {
        appointment
      }
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointment'
    });
  }
});

// Update appointment (student can update notes, counselor can update status and notes)
router.put('/:id', authenticateToken, [
  body('studentNotes').optional().isLength({ max: 500 }),
  body('counselorNotes').optional().isLength({ max: 1000 }),
  body('status').optional().isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']),
  body('followUpRequired').optional().isBoolean(),
  body('followUpDate').optional().isISO8601()
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

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check permissions
    const isStudent = appointment.student.toString() === req.user._id.toString();
    const isCounselor = appointment.counselor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isCounselor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update based on user role
    const updates = {};
    
    if (isStudent) {
      if (req.body.studentNotes !== undefined) {
        updates.studentNotes = req.body.studentNotes;
      }
      if (req.body.status === 'cancelled') {
        updates.status = 'cancelled';
      }
    }

    if (isCounselor || isAdmin) {
      if (req.body.counselorNotes !== undefined) {
        updates.counselorNotes = req.body.counselorNotes;
      }
      if (req.body.status !== undefined) {
        updates.status = req.body.status;
      }
      if (req.body.followUpRequired !== undefined) {
        updates.followUpRequired = req.body.followUpRequired;
      }
      if (req.body.followUpDate !== undefined) {
        updates.followUpDate = req.body.followUpDate;
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('student', 'firstName lastName email')
     .populate('counselor', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: {
        appointment: updatedAppointment
      }
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment'
    });
  }
});

// Cancel appointment
router.post('/:id/cancel', authenticateToken, [
  body('reason').optional().isLength({ max: 200 })
], async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user can cancel this appointment
    const canCancel = 
      appointment.student.toString() === req.user._id.toString() ||
      ['admin', 'counselor'].includes(req.user.role);

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if appointment can be cancelled (not completed or already cancelled)
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'Appointment cannot be cancelled'
      });
    }

    appointment.status = 'cancelled';
    if (req.body.reason) {
      appointment.counselorNotes = (appointment.counselorNotes || '') + 
        `\nCancellation reason: ${req.body.reason}`;
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment'
    });
  }
});

// Get counselor's appointments (for counselors and admins)
router.get('/counselor/:counselorId', authenticateToken, authorize('counselor', 'admin'), async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { page = 1, limit = 10, status, date } = req.query;
    const skip = (page - 1) * limit;

    const filter = { counselor: counselorId };
    if (status) filter.status = status;
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      filter.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const appointments = await Appointment.find(filter)
      .populate('student', 'firstName lastName email phone')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get counselor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve counselor appointments'
    });
  }
});

module.exports = router;
