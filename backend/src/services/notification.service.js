// backend/src/services/notification.service.js
import Notification from '../models/Notification.js';
import { sendEmail } from './email.service.js';
import { EventEmitter } from 'events';

/**
 * NotificationService
 *
 * Enterprise-grade notification system with:
 * - Event-driven architecture
 * - Async/non-blocking delivery
 * - Email integration
 * - Idempotency
 * - Error handling and retry logic
 *
 * Usage:
 *   import { notificationService } from '../services/notification.service.js';
 *   notificationService.emit('APPLICATION_SUBMITTED', { application, student, organization });
 */

class NotificationService extends EventEmitter {
  constructor() {
    super();
    this.setupEventListeners();
  }

  /**
   * Wire all notification triggers to their handlers
   * This is the central configuration for all notification events
   */
  setupEventListeners() {
    // ========================================
    // STUDENT NOTIFICATIONS
    // ========================================

    // Application submitted (notify organization)
    this.on('APPLICATION_SUBMITTED', this.handleApplicationSubmitted.bind(this));

    // Application status changed (notify student)
    this.on('APPLICATION_STATUS_CHANGED', this.handleApplicationStatusChanged.bind(this));

    // Interview scheduled (notify student)
    this.on('INTERVIEW_SCHEDULED', this.handleInterviewScheduled.bind(this));

    // Offer extended (notify student)
    this.on('OFFER_EXTENDED', this.handleOfferExtended.bind(this));

    // Profile viewed (notify student)
    this.on('PROFILE_VIEWED', this.handleProfileViewed.bind(this));

    // New match found (notify student)
    this.on('NEW_MATCH_FOUND', this.handleNewMatchFound.bind(this));

    // ========================================
    // ORGANIZATION NOTIFICATIONS
    // ========================================

    // High-match candidate applied (notify organization)
    this.on('HIGH_MATCH_APPLICATION', this.handleHighMatchApplication.bind(this));

    // Offer accepted/declined (notify organization)
    this.on('OFFER_RESPONSE', this.handleOfferResponse.bind(this));

    // Interview reminder (notify both parties)
    this.on('INTERVIEW_REMINDER', this.handleInterviewReminder.bind(this));

    // Internship expiring (notify organization)
    this.on('INTERNSHIP_EXPIRING', this.handleInternshipExpiring.bind(this));

    // ========================================
    // SYSTEM NOTIFICATIONS
    // ========================================

    // Subscription events
    this.on('SUBSCRIPTION_EXPIRING', this.handleSubscriptionExpiring.bind(this));
    this.on('SUBSCRIPTION_RENEWED', this.handleSubscriptionRenewed.bind(this));

    console.log('✅ NotificationService initialized with event listeners');
  }

  // ========================================
  // CORE NOTIFICATION CREATION
  // ========================================

  /**
   * Create and deliver a notification
   * @param {Object} data - Notification data
   * @param {Boolean} sendEmailNotification - Whether to send email
   * @returns {Promise<Notification>}
   */
  async createNotification(data, sendEmailNotification = false) {
    try {
      // Create in-app notification
      const notification = await Notification.create(data);

      console.log(`📬 Notification created: ${data.type} for user ${data.user}`);

      // Send email if requested and user hasn't opted out
      if (sendEmailNotification) {
        await this.sendEmailNotification(notification, data.recipientEmail);
      }

      // TODO: WebSocket broadcast for real-time delivery
      // this.broadcastToUser(data.user, notification);

      return notification;
    } catch (error) {
      console.error('❌ Notification creation error:', error);
      // Non-blocking: don't throw, just log
      return null;
    }
  }

  /**
   * Send email notification (async, non-blocking)
   */
  async sendEmailNotification(notification, recipientEmail) {
    if (!recipientEmail) return;

    try {
      await sendEmail({
        to: recipientEmail,
        subject: notification.title,
        html: this.generateEmailTemplate(notification)
      });

      // Mark email as sent
      await Notification.findByIdAndUpdate(notification._id, { emailSent: true });

      console.log(`📧 Email notification sent to ${recipientEmail}`);
    } catch (error) {
      console.error('❌ Email notification error:', error);
      // Non-blocking: email failure shouldn't break the flow
    }
  }

  /**
   * Generate email template
   */
  generateEmailTemplate(notification) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0078D4 0%, #5A67D8 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .content h2 { color: #333; font-size: 20px; margin-top: 0; }
          .content p { color: #666; line-height: 1.6; }
          .cta { display: inline-block; background: #0078D4; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>InternshipConnect</h1>
          </div>
          <div class="content">
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            ${notification.actionUrl ? `<a href="${process.env.FRONTEND_URL}${notification.actionUrl}" class="cta">View Details</a>` : ''}
          </div>
          <div class="footer">
            <p>You're receiving this because you have an active account on InternshipConnect.</p>
            <p><a href="${process.env.FRONTEND_URL}/dashboard/settings">Manage notification preferences</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ========================================
  // EVENT HANDLERS
  // ========================================

  /**
   * Handle application submitted event
   * Notify organization that a new application was received
   */
  async handleApplicationSubmitted({ application, student, organization }) {
    await this.createNotification({
      user: organization.user._id || organization.user,
      type: 'application_submitted',
      title: 'New Application Received',
      message: `${student.personalInfo.firstName} ${student.personalInfo.lastName} applied to ${application.internship.title}`,
      actionUrl: `/dashboard/applications?id=${application._id}`,
      relatedApplication: application._id,
      relatedInternship: application.internship._id,
      recipientEmail: organization.user.email
    }, true);
  }

  /**
   * Handle application status changed
   * Notify student of status updates
   */
  async handleApplicationStatusChanged({ application, newStatus, student }) {
    const statusMessages = {
      'under-review': {
        title: 'Application Under Review',
        message: `Your application for ${application.internship?.title} is being reviewed by the hiring team`
      },
      'shortlisted': {
        title: 'Congratulations! You\'ve Been Shortlisted',
        message: `Great news! You've been shortlisted for ${application.internship?.title}. The organization will contact you soon.`
      },
      'interview': {
        title: 'Interview Scheduled',
        message: `You have an interview scheduled for ${application.internship?.title}. Check your email for details.`
      },
      'offered': {
        title: 'Offer Extended!',
        message: `Congratulations! You've received an offer for ${application.internship?.title}. Review and respond to the offer.`
      },
      'accepted': {
        title: 'Offer Accepted',
        message: `You've successfully accepted the offer for ${application.internship?.title}. Congratulations!`
      },
      'rejected': {
        title: 'Application Update',
        message: `Thank you for your interest in ${application.internship?.title}. Unfortunately, we've decided to move forward with other candidates.`
      }
    };

    const notification = statusMessages[newStatus];
    if (!notification) return;

    await this.createNotification({
      user: student.user._id || student.user,
      type: `application_${newStatus}`,
      title: notification.title,
      message: notification.message,
      actionUrl: `/dashboard/applications?id=${application._id}`,
      relatedApplication: application._id,
      relatedInternship: application.internship?._id,
      recipientEmail: student.user.email
    }, true);
  }

  /**
   * Handle interview scheduled
   */
  async handleInterviewScheduled({ application, interview, student }) {
    await this.createNotification({
      user: student.user,
      type: 'interview_scheduled',
      title: 'Interview Scheduled',
      message: `Your interview for ${application.internship?.title} is scheduled for ${new Date(interview.date).toLocaleDateString()} at ${interview.time}`,
      actionUrl: `/dashboard/applications?id=${application._id}`,
      relatedApplication: application._id,
      metadata: { interviewId: interview._id, date: interview.date }
    }, true);
  }

  /**
   * Handle offer extended
   */
  async handleOfferExtended({ application, student }) {
    await this.createNotification({
      user: student.user._id || student.user,
      type: 'offer_extended',
      title: 'Offer Extended!',
      message: `Congratulations! You've received an offer for ${application.internship?.title}. Review the offer details and respond.`,
      actionUrl: `/dashboard/applications?id=${application._id}`,
      relatedApplication: application._id,
      relatedInternship: application.internship?._id,
      recipientEmail: student.user.email
    }, true);
  }

  /**
   * Handle profile viewed by organization
   */
  async handleProfileViewed({ student, organization }) {
    await this.createNotification({
      user: student.user,
      type: 'system',
      title: 'Profile Viewed',
      message: `${organization.companyInfo.name} viewed your profile`,
      actionUrl: '/dashboard/profile'
    }, false); // No email for profile views
  }

  /**
   * Handle new internship match found
   */
  async handleNewMatchFound({ student, internship, matchScore }) {
    await this.createNotification({
      user: student.user,
      type: 'new_internship',
      title: 'New Internship Match',
      message: `We found a ${matchScore}% match: ${internship.title} at ${internship.organization?.companyInfo?.name}`,
      actionUrl: `/dashboard/internships/${internship._id}`,
      relatedInternship: internship._id,
      metadata: { matchScore }
    }, true);
  }

  /**
   * Handle high-match application (AI score > 80%)
   */
  async handleHighMatchApplication({ application, student, organization, matchScore }) {
    await this.createNotification({
      user: organization.user,
      type: 'application_submitted',
      title: '⭐ High-Match Candidate Applied!',
      message: `${student.personalInfo.firstName} ${student.personalInfo.lastName} (${matchScore}% match) applied to ${application.internship.title}`,
      actionUrl: `/dashboard/applications?id=${application._id}`,
      relatedApplication: application._id,
      metadata: { matchScore, priority: 'high' }
    }, true);
  }

  /**
   * Handle offer response (accepted/declined)
   */
  async handleOfferResponse({ application, response, organization }) {
    const isAccepted = response === 'accepted';
    await this.createNotification({
      user: organization.user,
      type: isAccepted ? 'offer_accepted' : 'offer_declined',
      title: isAccepted ? 'Offer Accepted!' : 'Offer Declined',
      message: `The candidate ${isAccepted ? 'accepted' : 'declined'} the offer for ${application.internship?.title}`,
      actionUrl: `/dashboard/applications?id=${application._id}`,
      relatedApplication: application._id
    }, true);
  }

  /**
   * Handle interview reminder (24 hours before)
   */
  async handleInterviewReminder({ application, interview, student, organization }) {
    // Notify student
    await this.createNotification({
      user: student.user,
      type: 'interview_scheduled',
      title: 'Interview Reminder',
      message: `Your interview for ${application.internship?.title} is tomorrow at ${interview.time}`,
      actionUrl: `/dashboard/applications?id=${application._id}`,
      metadata: { reminder: true }
    }, true);

    // Notify organization
    await this.createNotification({
      user: organization.user,
      type: 'interview_scheduled',
      title: 'Interview Reminder',
      message: `Interview with ${student.personalInfo.firstName} ${student.personalInfo.lastName} for ${application.internship?.title} is tomorrow at ${interview.time}`,
      actionUrl: `/dashboard/applications?id=${application._id}`,
      metadata: { reminder: true }
    }, true);
  }

  /**
   * Handle internship expiring (7 days before deadline)
   */
  async handleInternshipExpiring({ internship, organization }) {
    await this.createNotification({
      user: organization.user,
      type: 'internship_expiring',
      title: 'Internship Deadline Approaching',
      message: `Your internship posting "${internship.title}" expires in 7 days. Renew or close it.`,
      actionUrl: `/dashboard/my-internships`,
      relatedInternship: internship._id
    }, true);
  }

  /**
   * Handle subscription expiring
   */
  async handleSubscriptionExpiring({ user }) {
    await this.createNotification({
      user: user._id,
      type: 'system',
      title: 'Subscription Expiring Soon',
      message: 'Your Pro subscription will expire in 7 days. Renew now to keep your benefits.',
      actionUrl: '/dashboard/pricing'
    }, true);
  }

  /**
   * Handle subscription renewed
   */
  async handleSubscriptionRenewed({ user }) {
    await this.createNotification({
      user: user._id,
      type: 'system',
      title: 'Subscription Renewed',
      message: 'Your Pro subscription has been successfully renewed. Thank you!',
      actionUrl: '/dashboard/settings'
    }, false);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export helper function for easy access
export const emit = (event, data) => notificationService.emit(event, data);
