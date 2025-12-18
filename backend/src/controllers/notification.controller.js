// backend/src/controllers/notification.controller.js
import Notification from '../models/Notification.js';
import { notificationService } from '../services/notification.service.js';

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
export const getNotifications = async (req, res) => {
  try {
    const { limit = 20, skip = 0, unreadOnly = false } = req.query;

    const notifications = await Notification.getUserNotifications(req.user._id, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      unreadOnly: unreadOnly === 'true'
    });

    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        hasMore: notifications.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve notifications'
    });
  }
};

/**
 * @desc    Get unread count only
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.markAsRead(req.params.id, req.user._id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read'
    });
  }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user._id);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notifications as read'
    });
  }
};

/**
 * @desc    Delete notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification'
    });
  }
};

/**
 * @desc    Create test notification (development only)
 * @route   POST /api/notifications/test
 * @access  Private
 */
export const createTestNotification = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Not available in production'
    });
  }

  try {
    const notification = await Notification.create({
      user: req.user._id,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working correctly.',
      actionUrl: '/dashboard'
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create notification'
    });
  }
};

/**
 * @desc    Test application notification flow (development only)
 * @route   POST /api/notifications/test-application-flow
 * @access  Private
 */
export const testApplicationFlow = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      error: 'Not available in production'
    });
  }

  try {
    console.log('\n🧪 ═══════════════════════════════════════════');
    console.log('🧪 TESTING APPLICATION NOTIFICATION FLOW');
    console.log('🧪 ═══════════════════════════════════════════');

    // Create mock data for testing
    const mockApplication = {
      _id: '507f1f77bcf86cd799439011',
      internship: {
        _id: '507f1f77bcf86cd799439012',
        title: 'Software Engineering Internship at TechCorp'
      }
    };

    const mockStudent = {
      _id: '507f1f77bcf86cd799439013',
      personalInfo: {
        firstName: 'John',
        lastName: 'Doe'
      },
      user: {
        _id: req.user._id,
        email: req.user.email
      }
    };

    const mockOrganization = {
      _id: '507f1f77bcf86cd799439014',
      companyInfo: {
        name: 'TechCorp Inc.'
      },
      user: {
        _id: req.user._id,
        email: req.user.email
      }
    };

    const results = [];

    // Test 1: APPLICATION_SUBMITTED
    console.log('\n📬 Test 1: APPLICATION_SUBMITTED event');
    notificationService.emit('APPLICATION_SUBMITTED', {
      application: mockApplication,
      student: mockStudent,
      organization: mockOrganization
    });
    results.push({ event: 'APPLICATION_SUBMITTED', status: 'emitted' });

    // Wait a bit for async processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: APPLICATION_STATUS_CHANGED (shortlisted)
    console.log('\n⭐ Test 2: APPLICATION_STATUS_CHANGED (shortlisted)');
    notificationService.emit('APPLICATION_STATUS_CHANGED', {
      application: mockApplication,
      newStatus: 'shortlisted',
      student: mockStudent
    });
    results.push({ event: 'APPLICATION_STATUS_CHANGED', status: 'emitted', newStatus: 'shortlisted' });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 3: OFFER_EXTENDED
    console.log('\n🎁 Test 3: OFFER_EXTENDED event');
    notificationService.emit('OFFER_EXTENDED', {
      application: mockApplication,
      student: mockStudent
    });
    results.push({ event: 'OFFER_EXTENDED', status: 'emitted' });

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get recent notifications to verify
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    console.log('\n✅ ═══════════════════════════════════════════');
    console.log(`✅ TEST COMPLETED - Created ${notifications.length} notifications`);
    console.log('✅ ═══════════════════════════════════════════\n');

    res.status(200).json({
      success: true,
      message: 'Application notification flow test completed',
      data: {
        testsRun: results,
        notificationsCreated: notifications.length,
        recentNotifications: notifications,
        instructions: {
          step1: 'Check your notification bell for new notifications',
          step2: 'Check the backend terminal for notification logs',
          step3: 'Check your email inbox for notification emails',
          step4: 'Visit /dashboard/notifications to see all notifications'
        }
      }
    });
  } catch (error) {
    console.error('❌ Test application flow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test notification flow',
      details: error.message
    });
  }
};