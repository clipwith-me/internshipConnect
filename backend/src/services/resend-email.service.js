import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'hello@internshipconnect.africa';
const APP_URL = process.env.APP_URL || 'https://internship-connect-beta.vercel.app';

export async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  RESEND_API_KEY not set — skipping email send');
    console.log(`📧 Would send to ${to}: ${subject}`);
    return { data: null, error: null };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `InternshipConnect <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    if (error) console.error('Resend error:', error);
    return { data, error };
  } catch (err) {
    console.error('Email send failed:', err);
    return { data: null, error: err };
  }
}

// ─── Shared layout ──────────────────────────────────────────────────────────

function baseTemplate(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>InternshipConnect</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0D1426;padding:28px 40px;text-align:center;">
            <span style="font-size:22px;font-weight:700;color:#E8A230;letter-spacing:-0.5px;">InternshipConnect</span>
            <br/>
            <span style="font-size:12px;color:#2EC4B6;margin-top:4px;display:inline-block;">Africa's Career Infrastructure Platform</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;color:#1a1a2e;font-size:15px;line-height:1.7;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8f9fa;padding:24px 40px;text-align:center;border-top:1px solid #e9ecef;">
            <p style="margin:0 0 8px;font-size:12px;color:#868e96;">
              © ${new Date().getFullYear()} InternshipConnect. All rights reserved.
            </p>
            <p style="margin:0;font-size:12px;color:#868e96;">
              <a href="${APP_URL}" style="color:#E8A230;text-decoration:none;">Visit Platform</a>
              &nbsp;·&nbsp;
              <a href="${APP_URL}/auth/login" style="color:#868e96;text-decoration:none;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(text, url, primary = true) {
  const bg = primary ? '#E8A230' : '#ffffff';
  const color = primary ? '#0D1426' : '#E8A230';
  const border = primary ? 'none' : '2px solid #E8A230';
  return `<a href="${url}" style="display:inline-block;padding:13px 28px;background:${bg};color:${color};border:${border};border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;margin:8px 4px;">${text}</a>`;
}

// ─── Email 1 — Student Welcome ───────────────────────────────────────────────

export async function sendStudentWelcomeEmail({ to, firstName, referralCode }) {
  const referralUrl = `${APP_URL}/auth/register?ref=${referralCode}`;
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;font-size:22px;color:#0D1426;">Welcome to InternshipConnect, ${firstName}! 🎯</h2>
    <p>You've just joined Africa's career infrastructure platform. Thousands of students across Nigeria are already discovering internships, building their profiles, and taking their first steps into meaningful careers.</p>
    <p style="font-weight:600;margin-top:24px;">Here's how to get started in the next 10 minutes:</p>

    <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-weight:600;">Step 1 — Complete Your Profile</p>
      <p style="margin:0 0 12px;color:#495057;font-size:14px;">A complete profile gets 3× more employer views. Add your skills, upload your resume, and tell employers what makes you stand out.</p>
      ${ctaButton('Complete Your Profile', `${APP_URL}/dashboard/profile`)}
    </div>

    <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-weight:600;">Step 2 — Browse Internships</p>
      <p style="margin:0 0 12px;color:#495057;font-size:14px;">Explore hundreds of verified internship opportunities matched to your skills and interests.</p>
      ${ctaButton('Browse Internships', `${APP_URL}/internships`)}
    </div>

    <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;font-weight:600;">Step 3 — Apply to Your First Role</p>
      <p style="margin:0 0 12px;color:#495057;font-size:14px;">Found something interesting? Apply in under 2 minutes.</p>
      ${ctaButton('Find Opportunities', `${APP_URL}/internships`)}
    </div>

    <hr style="border:none;border-top:1px solid #e9ecef;margin:32px 0;" />

    <h3 style="margin:0 0 12px;color:#0D1426;">Refer a Friend — Earn Benefits</h3>
    <p>Know a fellow student who should be on InternshipConnect? Share your personal referral link and help them discover opportunities too.</p>
    <p style="background:#fff9e6;border:1px solid #E8A230;border-radius:6px;padding:12px 16px;font-family:monospace;font-size:14px;word-break:break-all;">${referralUrl}</p>
    ${ctaButton('Share Your Referral Link', referralUrl)}
    <p style="font-size:13px;color:#868e96;margin-top:12px;">Every student you refer who completes their profile earns you priority access to new features.</p>
  `);

  return sendEmail({ to, subject: `Welcome to InternshipConnect, ${firstName}! 🎯`, html });
}

// ─── Email 2 — Company Welcome ───────────────────────────────────────────────

export async function sendCompanyWelcomeEmail({ to, companyName, plan = 'Free' }) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;font-size:22px;color:#0D1426;">Welcome to InternshipConnect</h2>
    <p>Hi <strong>${companyName}</strong> team,</p>
    <p>You've joined the platform connecting Africa's best young talent to companies that are building the future. Getting started is simple:</p>

    <div style="margin:20px 0;">
      ${ctaButton('Complete Your Company Profile', `${APP_URL}/dashboard/settings`)}
      ${ctaButton('Post Your First Internship', `${APP_URL}/dashboard/internships/create`, false)}
    </div>

    <div style="background:#f0f9ff;border-left:4px solid #2EC4B6;padding:16px 20px;border-radius:0 8px 8px 0;margin:24px 0;">
      <p style="margin:0 0 4px;font-weight:600;color:#0D1426;">Your Plan: ${plan}</p>
      <p style="margin:0;font-size:14px;color:#495057;">${plan === 'Free' ? 'You can post up to 2 active internships.' : plan === 'Pro' ? 'Post unlimited internships + access AI candidate ranking.' : 'Enterprise features enabled.'}</p>
    </div>

    <p>Submit your CAC registration to receive a <strong>verified badge</strong> — verified companies get significantly more applications.</p>
    ${ctaButton('Go to Your Dashboard', `${APP_URL}/dashboard`)}

    <p style="margin-top:24px;font-size:14px;color:#868e96;">Questions? Reply to this email — we read every message.</p>
    <p style="margin:4px 0 0;font-size:14px;color:#0D1426;font-weight:600;">The InternshipConnect Team</p>
  `);

  return sendEmail({ to, subject: `Welcome to InternshipConnect — Start Finding Great Interns Today`, html });
}

// ─── Email 3 — New Application to Employer ───────────────────────────────────

export async function sendNewApplicationEmail({ to, recruiterName, studentName, university, graduationYear, skills, internshipTitle, studentId, applicationId }) {
  const skillsText = Array.isArray(skills) ? skills.slice(0, 5).join(', ') : skills || 'N/A';
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#0D1426;">You have a new applicant</h2>
    <p>Hi ${recruiterName || 'there'},</p>
    <p><strong>${studentName}</strong> just applied for your <strong>${internshipTitle}</strong> position.</p>

    <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;">
      <h3 style="margin:0 0 14px;font-size:15px;color:#0D1426;">Applicant Overview</h3>
      <table cellpadding="0" cellspacing="0" width="100%">
        <tr><td style="padding:4px 0;color:#495057;font-size:14px;width:140px;">Name</td><td style="padding:4px 0;font-size:14px;font-weight:600;">${studentName}</td></tr>
        <tr><td style="padding:4px 0;color:#495057;font-size:14px;">University</td><td style="padding:4px 0;font-size:14px;">${university || 'N/A'}</td></tr>
        <tr><td style="padding:4px 0;color:#495057;font-size:14px;">Graduation</td><td style="padding:4px 0;font-size:14px;">${graduationYear || 'N/A'}</td></tr>
        <tr><td style="padding:4px 0;color:#495057;font-size:14px;">Skills</td><td style="padding:4px 0;font-size:14px;">${skillsText}</td></tr>
      </table>
    </div>

    ${ctaButton('Review Application', `${APP_URL}/dashboard/applications/${applicationId}`)}
    <br/>
    <a href="${APP_URL}/dashboard/applications?internship=${internshipTitle}" style="font-size:13px;color:#868e96;display:inline-block;margin-top:12px;">View all applications for ${internshipTitle} →</a>
  `);

  return sendEmail({ to, subject: `New Application: ${studentName} applied for ${internshipTitle}`, html });
}

// ─── Email 4 — Application Status Update to Student ─────────────────────────

const statusConfig = {
  'under-review': {
    subject: (company, role) => `Update: ${company} is reviewing your application for ${role}`,
    heading: 'Application Under Review',
    emoji: '🔍',
    color: '#E8A230',
    message: (company, role) => `Good news — <strong>${company}</strong> has started reviewing your application for <strong>${role}</strong>. This means your profile stood out enough to get noticed. Hang tight!`,
    extra: null,
  },
  shortlisted: {
    subject: (company, role) => `Great news! You've been shortlisted by ${company} 🎉`,
    heading: 'You've Been Shortlisted!',
    emoji: '🎉',
    color: '#2EC4B6',
    message: (company, role) => `Congratulations! <strong>${company}</strong> has shortlisted your application for <strong>${role}</strong>. You're one step closer — keep an eye on your email for next steps.`,
    extra: null,
  },
  interview: {
    subject: (company, role) => `Interview Request: ${company} wants to meet you`,
    heading: 'Interview Invitation',
    emoji: '🤝',
    color: '#7c3aed',
    message: (company, role) => `Exciting news! <strong>${company}</strong> would like to schedule an interview with you for <strong>${role}</strong>. Check your application dashboard for details.`,
    extra: null,
  },
  offered: {
    subject: (company, role) => `Congratulations! You have an offer from ${company} 🎊`,
    heading: 'You Have an Offer!',
    emoji: '🎊',
    color: '#16a34a',
    message: (company, role) => `Amazing achievement! <strong>${company}</strong> has extended an offer for the <strong>${role}</strong> position. Log in to your dashboard to review the offer details and respond.`,
    extra: null,
  },
  rejected: {
    subject: (company, role) => `Update on your application to ${company}`,
    heading: 'Application Update',
    emoji: '📋',
    color: '#6b7280',
    message: (company, role) => `Thank you for applying to <strong>${company}</strong> for the <strong>${role}</strong> role. After careful review, they've decided to move forward with other candidates at this time.`,
    extra: `<div style="background:#f8f9fa;border-radius:8px;padding:16px 20px;margin:20px 0;font-size:14px;color:#495057;">
      <strong>Don't be discouraged</strong> — most successful interns applied to multiple roles before landing the right one. Keep going!
    </div>`,
  },
};

export async function sendApplicationStatusEmail({ to, studentName, companyName, internshipTitle, newStatus, applicationId }) {
  const config = statusConfig[newStatus];
  if (!config) return;

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:28px;">
      <span style="font-size:48px;">${config.emoji}</span>
      <h2 style="margin:12px 0 0;font-size:20px;color:${config.color};">${config.heading}</h2>
    </div>
    <p>Hi ${studentName},</p>
    <p>${config.message(companyName, internshipTitle)}</p>
    ${config.extra || ''}
    ${ctaButton('View Application', `${APP_URL}/dashboard/applications`)}
    ${newStatus === 'rejected' ? `<br/>${ctaButton('Browse More Internships', `${APP_URL}/internships`, false)}` : ''}
  `);

  return sendEmail({ to, subject: config.subject(companyName, internshipTitle), html });
}

// ─── Email 5 — Deadline Reminder ─────────────────────────────────────────────

export async function sendDeadlineReminderEmail({ to, studentName, internshipTitle, companyName, deadline, internshipId }) {
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#0D1426;">⏰ Closing Soon</h2>
    <p>Hi ${studentName},</p>
    <p>Just a reminder — <strong>${internshipTitle}</strong> at <strong>${companyName}</strong> is closing in <strong>2 days</strong> (${new Date(deadline).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })}).</p>
    <p>Don't miss your chance to apply!</p>
    ${ctaButton('Apply Now', `${APP_URL}/internships/${internshipId}`)}
    <p style="font-size:13px;color:#868e96;margin-top:16px;">You saved this internship earlier. <a href="${APP_URL}/dashboard/saved" style="color:#868e96;">Manage saved internships →</a></p>
  `);

  return sendEmail({ to, subject: `Closing soon: ${internshipTitle} at ${companyName} closes in 2 days`, html });
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail({ to, resetToken, userName }) {
  const resetUrl = `${APP_URL}/auth/reset-password/${resetToken}`;
  const html = baseTemplate(`
    <h2 style="margin:0 0 16px;font-size:20px;color:#0D1426;">Reset Your Password</h2>
    <p>Hi ${userName || 'there'},</p>
    <p>You requested a password reset for your InternshipConnect account. Click the button below to set a new password.</p>
    <div style="text-align:center;margin:28px 0;">
      ${ctaButton('Reset Password', resetUrl)}
    </div>
    <p style="font-size:13px;color:#868e96;">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your account is secure.</p>
    <p style="font-size:13px;color:#868e96;margin-top:12px;">Or copy this URL into your browser:<br/><span style="font-family:monospace;word-break:break-all;">${resetUrl}</span></p>
  `);

  return sendEmail({ to, subject: 'Reset your InternshipConnect password', html });
}
