// backend/src/controllers/messaging.controller.js
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import OrganizationProfile from '../models/OrganizationProfile.js';
import Notification from '../models/Notification.js';

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/messages/conversations
 * @access  Private (Pro students or Organizations)
 */
export const getConversations = async (req, res) => {
  try {
    // Check if student has Pro plan
    if (req.user.role === 'student') {
      const plan = req.user.subscription?.plan || 'free';
      if (plan !== 'pro') {
        return res.status(403).json({
          success: false,
          error: 'Direct messaging is only available for Pro subscribers',
          upgradeRequired: true,
          feature: 'Direct Messaging'
        });
      }
    }

    const conversations = await Conversation.find({
      'participants.user': req.user._id,
      status: { $ne: 'archived' }
    })
      .populate('participants.user', 'email role')
      .populate('lastMessage.sender', 'email')
      .populate('internship', 'title company')
      .sort({ updatedAt: -1 })
      .lean();

    // Add unread count for current user
    const conversationsWithUnread = conversations.map(conv => ({
      ...conv,
      unreadCount: conv.unreadCount?.[req.user._id.toString()] || 0
    }));

    res.json({
      success: true,
      data: conversationsWithUnread
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
};

/**
 * @desc    Start new conversation
 * @route   POST /api/messages/conversations
 * @access  Private (Pro students or Organizations)
 */
export const startConversation = async (req, res) => {
  try {
    const { recipientId, internshipId, initialMessage } = req.body;

    // Check if student has Pro plan
    if (req.user.role === 'student') {
      const plan = req.user.subscription?.plan || 'free';
      if (plan !== 'pro') {
        return res.status(403).json({
          success: false,
          error: 'Direct messaging is only available for Pro subscribers',
          upgradeRequired: true,
          feature: 'Direct Messaging'
        });
      }
    }

    // Validate recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: 'Recipient not found'
      });
    }

    // Cannot message yourself
    if (recipient._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Cannot start conversation with yourself'
      });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      $and: [
        { 'participants.user': req.user._id },
        { 'participants.user': recipientId }
      ]
    });

    if (existingConversation) {
      return res.json({
        success: true,
        data: existingConversation,
        message: 'Conversation already exists'
      });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      participants: [
        {
          user: req.user._id,
          userType: req.user.role
        },
        {
          user: recipientId,
          userType: recipient.role
        }
      ],
      internship: internshipId,
      initiatedBy: req.user._id,
      isPro: req.user.role === 'student', // Track if Pro feature
      unreadCount: {
        [recipientId.toString()]: 0
      }
    });

    // Send initial message if provided
    if (initialMessage) {
      const message = await Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        senderType: req.user.role,
        content: initialMessage,
        status: 'sent'
      });

      // Update conversation with last message
      await conversation.updateLastMessage(message);

      // Increment unread count for recipient
      await conversation.incrementUnreadCount(recipientId);

      // Send notification to recipient
      await Notification.create({
        recipient: recipientId,
        type: 'message',
        title: 'New Message',
        message: `You have a new message from ${req.user.email}`,
        link: `/dashboard/messages/${conversation._id}`,
        metadata: {
          conversationId: conversation._id.toString(),
          senderId: req.user._id.toString()
        }
      });
    }

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants.user', 'email role')
      .populate('internship', 'title company');

    res.status(201).json({
      success: true,
      data: populatedConversation
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start conversation'
    });
  }
};

/**
 * @desc    Get messages in conversation
 * @route   GET /api/messages/conversations/:id
 * @access  Private (Participants only)
 */
export const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Verify user is participant
    if (!conversation.hasParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'You are not a participant in this conversation'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      conversation: req.params.id,
      isDeleted: false
    })
      .populate('sender', 'email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Mark messages as read
    await conversation.resetUnreadCount(req.user._id);

    // Mark individual messages as read
    const unreadMessages = await Message.find({
      conversation: req.params.id,
      sender: { $ne: req.user._id },
      'readBy.user': { $ne: req.user._id }
    });

    await Promise.all(
      unreadMessages.map(msg => msg.markAsRead(req.user._id))
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Return in chronological order
        conversation: conversation
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

/**
 * @desc    Send message in conversation
 * @route   POST /api/messages/conversations/:id/messages
 * @access  Private (Participants only)
 */
export const sendMessage = async (req, res) => {
  try {
    const { content, attachments } = req.body;

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Verify user is participant
    if (!conversation.hasParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'You are not a participant in this conversation'
      });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content is required'
      });
    }

    // Create message
    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      senderType: req.user.role,
      content: content.trim(),
      attachments: attachments || [],
      status: 'sent'
    });

    // Update conversation
    await conversation.updateLastMessage(message);

    // Increment unread count for other participants
    const otherParticipants = conversation.participants.filter(
      p => p.user.toString() !== req.user._id.toString()
    );

    await Promise.all(
      otherParticipants.map(p => conversation.incrementUnreadCount(p.user))
    );

    // Send notifications to other participants
    await Promise.all(
      otherParticipants.map(p =>
        Notification.create({
          recipient: p.user,
          type: 'message',
          title: 'New Message',
          message: `You have a new message from ${req.user.email}`,
          link: `/dashboard/messages/${conversation._id}`,
          metadata: {
            conversationId: conversation._id.toString(),
            messageId: message._id.toString(),
            senderId: req.user._id.toString()
          }
        })
      )
    );

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'email role');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

/**
 * @desc    Delete/Archive conversation
 * @route   DELETE /api/messages/conversations/:id
 * @access  Private (Participants only)
 */
export const deleteConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Verify user is participant
    if (!conversation.hasParticipant(req.user._id)) {
      return res.status(403).json({
        success: false,
        error: 'You are not a participant in this conversation'
      });
    }

    // Archive instead of delete
    conversation.status = 'archived';
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation archived successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation'
    });
  }
};

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      'participants.user': req.user._id,
      status: 'active'
    }).lean();

    const totalUnread = conversations.reduce((sum, conv) => {
      const count = conv.unreadCount?.[req.user._id.toString()] || 0;
      return sum + count;
    }, 0);

    res.json({
      success: true,
      data: {
        unreadCount: totalUnread
      }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread count'
    });
  }
};

export default {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  deleteConversation,
  getUnreadCount
};
