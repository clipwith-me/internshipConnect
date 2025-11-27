// backend/src/services/email.service.js

/**
 * 📧 Email Service
 *
 * Handles all email sending functionality including:
 * - Forgot password emails
 * - Welcome emails
 * - Application status notifications
 * - Internship match notifications
 */

// ✅ FIX: Lazy transporter creation - create when first needed, not at module load
let transporter = null;
let transporterInitialized = false;
let nodemailer = null;

const getTransporter = async () => {
  // Only create transporter once, when first needed
  if (!transporterInitialized) {
    transporterInitialized = true;

    // Dynamically import nodemailer to ensure it loads after dotenv
    if (!nodemailer) {
      const nodemailerModule = await import('nodemailer');
      nodemailer = nodemailerModule.default;
    }

    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️  SMTP not configured - emails will be logged to console only');
      transporter = null;
      return null;
    }

    console.log('📧 Creating SMTP transporter...');
    console.log('📧 SMTP Host:', process.env.SMTP_HOST);
    console.log('📧 SMTP Port:', process.env.SMTP_PORT);
    console.log('📧 SMTP User:', process.env.SMTP_USER);
    console.log('📧 SMTP Pass:', process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // Use STARTTLS (false for port 587, true for 465)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // ✅ FIX: Gmail requires TLS configuration
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false // Accept self-signed certificates
      },
      // ✅ FIX: Add connection timeouts (reduced for faster failures)
      connectionTimeout: 5000, // 5 seconds
      greetingTimeout: 5000,
      socketTimeout: 5000,
      // ✅ FIX: Enable debug mode in development
      logger: process.env.NODE_ENV === 'development',
      debug: process.env.NODE_ENV === 'development'
    });
  }

  return transporter;
};

/**
 * Send email (generic) - ✅ ENHANCED WITH DETAILED LOGGING
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const currentTransporter = await getTransporter(); // Get transporter lazily

    // If SMTP not configured, log to console (development mode)
    if (!currentTransporter) {
      console.log('\n📧 ═══════════════════════════════════════════');
      console.log('📧 EMAIL (SMTP not configured - console only)');
      console.log('📧 ═══════════════════════════════════════════');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log('Message:');
      console.log(text || html);
      console.log('📧 ═══════════════════════════════════════════\n');
      return { success: true, messageId: 'console-only' };
    }

    // ✅ FIX: Add detailed logging before sending
    console.log(`\n📧 ═══════════════════════════════════════════`);
    console.log(`📧 SENDING EMAIL`);
    console.log(`📧 ═══════════════════════════════════════════`);
    console.log(`📧 To: ${to}`);
    console.log(`📧 Subject: ${subject}`);
    console.log(`📧 From: "${process.env.SMTP_USER}"`);

    const mailOptions = {
      from: `"InternshipConnect" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    };

    console.log('📧 Mail options prepared, connecting to Gmail...');

    const info = await currentTransporter.sendMail(mailOptions);

    // ✅ FIX: Detailed success logging
    console.log(`✅ ═══════════════════════════════════════════`);
    console.log(`✅ EMAIL SENT SUCCESSFULLY!`);
    console.log(`✅ ═══════════════════════════════════════════`);
    console.log(`✅ Message ID: ${info.messageId}`);
    console.log(`✅ Response: ${info.response}`);
    console.log(`✅ Accepted: ${JSON.stringify(info.accepted)}`);
    console.log(`✅ Rejected: ${JSON.stringify(info.rejected)}`);
    console.log(`✅ ═══════════════════════════════════════════\n`);

    return { success: true, messageId: info.messageId, info };
  } catch (error) {
    // ✅ FIX: Enhanced error logging with all details
    console.error('\n❌ ═══════════════════════════════════════════');
    console.error('❌ EMAIL SEND ERROR');
    console.error('❌ ═══════════════════════════════════════════');
    console.error('❌ Error Name:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Code:', error.code);
    console.error('❌ Error Command:', error.command);
    console.error('❌ Response Code:', error.responseCode);
    console.error('❌ Full Error Object:', error);
    console.error('❌ ═══════════════════════════════════════════\n');
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async ({ to, resetToken, userName }) => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #0078D4 0%, #005A9E 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #ffffff;
          padding: 40px 30px;
          border: 1px solid #e0e0e0;
          border-top: none;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: #0078D4;
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          background: #f5f5f5;
          padding: 20px 30px;
          border-radius: 0 0 8px 8px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 12px;
          margin: 20px 0;
          border-radius: 4px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">🔒 Password Reset Request</h1>
      </div>

      <div class="content">
        <p style="font-size: 16px;">Hello${userName ? ' ' + userName : ''},</p>

        <p>We received a request to reset your password for your InternshipConnect account.</p>

        <p>Click the button below to reset your password:</p>

        <div style="text-align: center;">
          <a href="${resetUrl}" class="button">Reset Password</a>
        </div>

        <p style="font-size: 14px; color: #666;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #0078D4; word-break: break-all;">${resetUrl}</a>
        </p>

        <div class="warning">
          <strong>⚠️ Security Notice:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>This link will expire in 10 minutes</li>
            <li>If you didn't request this, you can safely ignore this email</li>
            <li>Your password won't change until you create a new one</li>
          </ul>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Need help? Contact us at support@internshipconnect.com
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0;">
          © ${new Date().getFullYear()} InternshipConnect. All rights reserved.<br>
          AI-Powered Career Matching
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Password Reset Request

Hello${userName ? ' ' + userName : ''},

We received a request to reset your password for your InternshipConnect account.

Click the link below to reset your password:
${resetUrl}

⚠️ Security Notice:
- This link will expire in 10 minutes
- If you didn't request this, you can safely ignore this email
- Your password won't change until you create a new one

Need help? Contact us at support@internshipconnect.com

© ${new Date().getFullYear()} InternshipConnect. All rights reserved.
  `;

  return sendEmail({
    to,
    subject: '🔒 Reset Your Password - InternshipConnect',
    html,
    text
  });
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async ({ to, userName, role }) => {
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #0078D4 0%, #005A9E 100%);
          color: white;
          padding: 40px 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #ffffff;
          padding: 40px 30px;
          border: 1px solid #e0e0e0;
          border-top: none;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: #0078D4;
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          background: #f5f5f5;
          padding: 20px 30px;
          border-radius: 0 0 8px 8px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .feature {
          background: #f8f9fa;
          padding: 15px;
          margin: 10px 0;
          border-radius: 6px;
          border-left: 4px solid #0078D4;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to InternshipConnect!</h1>
      </div>

      <div class="content">
        <p style="font-size: 18px; font-weight: 600;">Hello ${userName},</p>

        <p>Welcome to InternshipConnect! We're excited to have you join our community of ${role === 'student' ? 'ambitious students and future professionals' : 'innovative organizations and hiring teams'}.</p>

        ${role === 'student' ? `
        <h3 style="color: #0078D4; margin-top: 30px;">🚀 Get Started:</h3>

        <div class="feature">
          <strong>1. Complete Your Profile</strong><br>
          Add your education, skills, and experience to stand out to employers
        </div>

        <div class="feature">
          <strong>2. Browse Internships</strong><br>
          Explore thousands of opportunities matched to your interests
        </div>

        <div class="feature">
          <strong>3. Generate AI Resumes</strong><br>
          Get 3 free AI-generated resumes tailored to each application
        </div>

        <div class="feature">
          <strong>4. Track Applications</strong><br>
          Monitor your application status in real-time
        </div>
        ` : `
        <h3 style="color: #0078D4; margin-top: 30px;">🚀 Get Started:</h3>

        <div class="feature">
          <strong>1. Set Up Your Company Profile</strong><br>
          Showcase your organization to attract top talent
        </div>

        <div class="feature">
          <strong>2. Post Internships</strong><br>
          Create up to 3 listings for free
        </div>

        <div class="feature">
          <strong>3. Review Applications</strong><br>
          Manage candidates with our intuitive dashboard
        </div>

        <div class="feature">
          <strong>4. Upgrade for AI Matching</strong><br>
          Let AI help you find the perfect candidates
        </div>
        `}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Questions? We're here to help! Contact us at support@internshipconnect.com
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0;">
          © ${new Date().getFullYear()} InternshipConnect. All rights reserved.<br>
          AI-Powered Career Matching
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Welcome to InternshipConnect!

Hello ${userName},

Welcome to InternshipConnect! We're excited to have you join our community.

${role === 'student' ? `
Get Started:
1. Complete Your Profile - Add your education, skills, and experience
2. Browse Internships - Explore thousands of opportunities
3. Generate AI Resumes - Get 3 free AI-generated resumes
4. Track Applications - Monitor your application status
` : `
Get Started:
1. Set Up Your Company Profile - Showcase your organization
2. Post Internships - Create up to 3 listings for free
3. Review Applications - Manage candidates easily
4. Upgrade for AI Matching - Find the perfect candidates
`}

Go to your dashboard: ${dashboardUrl}

Questions? Contact us at support@internshipconnect.com

© ${new Date().getFullYear()} InternshipConnect. All rights reserved.
  `;

  return sendEmail({
    to,
    subject: `🎉 Welcome to InternshipConnect, ${userName}!`,
    html,
    text
  });
};

/**
 * Send application status notification
 */
export const sendApplicationStatusEmail = async ({ to, userName, internshipTitle, status, companyName }) => {
  const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard/applications`;

  const statusMessages = {
    'under-review': {
      emoji: '👀',
      title: 'Application Under Review',
      message: 'Good news! Your application is now being reviewed by the hiring team.'
    },
    'shortlisted': {
      emoji: '⭐',
      title: 'You\'ve Been Shortlisted!',
      message: 'Congratulations! You\'ve been shortlisted for the next stage.'
    },
    'interview': {
      emoji: '📅',
      title: 'Interview Scheduled',
      message: 'Great news! You\'ve been invited for an interview.'
    },
    'offered': {
      emoji: '🎉',
      title: 'Job Offer Received!',
      message: 'Amazing! You\'ve received an offer for this position.'
    },
    'accepted': {
      emoji: '✅',
      title: 'Offer Accepted',
      message: 'Your acceptance has been confirmed. Congratulations on your new internship!'
    },
    'rejected': {
      emoji: '💪',
      title: 'Application Update',
      message: 'Thank you for your interest. While we won\'t be moving forward with your application this time, we encourage you to keep applying.'
    }
  };

  const statusInfo = statusMessages[status] || statusMessages['under-review'];

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #0078D4 0%, #005A9E 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #ffffff;
          padding: 40px 30px;
          border: 1px solid #e0e0e0;
          border-top: none;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: #0078D4;
          color: white !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          background: #f5f5f5;
          padding: 20px 30px;
          border-radius: 0 0 8px 8px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .info-box {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">${statusInfo.emoji} ${statusInfo.title}</h1>
      </div>

      <div class="content">
        <p style="font-size: 16px;">Hello ${userName},</p>

        <p>${statusInfo.message}</p>

        <div class="info-box">
          <strong>Position:</strong> ${internshipTitle}<br>
          <strong>Company:</strong> ${companyName}<br>
          <strong>Status:</strong> ${status.replace('-', ' ').toUpperCase()}
        </div>

        <div style="text-align: center;">
          <a href="${dashboardUrl}" class="button">View Application</a>
        </div>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Keep up the great work! Check your dashboard for more opportunities.
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0;">
          © ${new Date().getFullYear()} InternshipConnect. All rights reserved.<br>
          AI-Powered Career Matching
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
${statusInfo.emoji} ${statusInfo.title}

Hello ${userName},

${statusInfo.message}

Position: ${internshipTitle}
Company: ${companyName}
Status: ${status.replace('-', ' ').toUpperCase()}

View your application: ${dashboardUrl}

© ${new Date().getFullYear()} InternshipConnect. All rights reserved.
  `;

  return sendEmail({
    to,
    subject: `${statusInfo.emoji} ${statusInfo.title} - ${internshipTitle}`,
    html,
    text
  });
};

/**
 * Verify SMTP connection - ✅ ENHANCED WITH DETAILED DIAGNOSTICS
 */
export const verifyEmailConnection = async () => {
  const currentTransporter = await getTransporter(); // Get transporter lazily

  if (!currentTransporter) {
    console.warn('⚠️  SMTP not configured - skipping verification');
    return {
      success: false,
      message: 'SMTP not configured'
    };
  }

  try {
    console.log('\n🔍 ═══════════════════════════════════════════');
    console.log('🔍 VERIFYING SMTP CONNECTION');
    console.log('🔍 ═══════════════════════════════════════════');
    console.log('🔍 Connecting to:', process.env.SMTP_HOST);
    console.log('🔍 Port:', process.env.SMTP_PORT);
    console.log('🔍 User:', process.env.SMTP_USER);
    console.log('🔍 Testing authentication...');

    await currentTransporter.verify();

    console.log('✅ ═══════════════════════════════════════════');
    console.log('✅ SMTP CONNECTION VERIFIED!');
    console.log('✅ ═══════════════════════════════════════════');
    console.log('✅ Gmail SMTP is ready to send emails');
    console.log('✅ Emails will be delivered to real inboxes');
    console.log('✅ ═══════════════════════════════════════════\n');

    return {
      success: true,
      message: 'SMTP connection successful'
    };
  } catch (error) {
    console.error('\n❌ ═══════════════════════════════════════════');
    console.error('❌ SMTP VERIFICATION FAILED!');
    console.error('❌ ═══════════════════════════════════════════');
    console.error('❌ Error Name:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Code:', error.code);
    console.error('❌ Full Error:', error);
    console.error('❌ ═══════════════════════════════════════════');
    console.error('\n💡 COMMON GMAIL SMTP ISSUES:');
    console.error('1. ❌ App Password has spaces (must remove ALL spaces)');
    console.error('2. ❌ 2-Step Verification not enabled on Gmail account');
    console.error('3. ❌ App Password not generated or incorrect');
    console.error('4. ❌ Wrong SMTP settings (should be smtp.gmail.com:587)');
    console.error('5. ❌ Gmail account locked or suspicious activity detected');
    console.error('\n📝 CURRENT SMTP CONFIGURATION:');
    console.error('   Host:', process.env.SMTP_HOST);
    console.error('   Port:', process.env.SMTP_PORT);
    console.error('   User:', process.env.SMTP_USER);
    console.error('   Pass:', process.env.SMTP_PASS ? '****' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
    console.error('   Pass Length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length + ' characters' : 'N/A');
    console.error('\n🔧 HOW TO FIX:');
    console.error('1. Open backend/.env file');
    console.error('2. Find SMTP_PASS line');
    console.error('3. Remove ALL spaces from the password');
    console.error('4. Restart backend server');
    console.error('❌ ═══════════════════════════════════════════\n');

    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

export default {
  sendEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendApplicationStatusEmail,
  verifyEmailConnection
};