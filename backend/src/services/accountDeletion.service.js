// backend/src/services/accountDeletion.service.js
//
// Self-service account deletion ("right to erasure").
//
// Design: personal data is erased or anonymised, but records other users rely on
// (applications in an employer's pipeline, listings' history, payment records)
// are kept without the person's identity. Every step is idempotent and the login
// credentials are disabled LAST, so if anything fails part-way the user can retry
// and no half-deleted account is left able to sign in.

import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import {
  User,
  StudentProfile,
  OrganizationProfile,
  University,
  Internship,
  Application,
  Resume,
  Notification,
  SavedInternship,
  ReferralCode,
  Referral,
  CompanyVerification,
} from '../models/index.js';
import { deleteFromCloudinary } from './upload.service.js';

const OPEN_APPLICATION_STATES = ['submitted', 'under-review', 'shortlisted', 'interview', 'offered'];
const PAID_STUDENT = ['premium', 'pro'];
const PAID_ORG = ['professional', 'enterprise'];

/** Does this user still have an active paid subscription that must be cancelled first? */
export const hasActivePaidSubscription = (user) => {
  const sub = user?.subscription;
  if (!sub?.stripeSubscriptionId) return false;
  const paidPlans = user.role === 'student' ? PAID_STUDENT : PAID_ORG;
  return paidPlans.includes(sub.plan) && ['active', 'trialing', 'past_due'].includes(sub.status);
};

const bestEffort = async (label, fn) => {
  try {
    await fn();
  } catch (err) {
    console.error(`Account deletion: ${label} failed (continuing):`, err.message);
  }
};

const removeLocalResume = (fileName) => {
  if (!fileName) return;
  const file = path.join(process.cwd(), 'uploads', 'resumes', path.basename(fileName));
  if (fs.existsSync(file)) fs.unlinkSync(file);
};

async function eraseStudent(user) {
  const profile = await StudentProfile.findOne({ user: user._id });
  if (!profile) return;

  // Resume files (stored in Cloudinary and/or on local disk) and records
  const resumes = await Resume.find({ student: profile._id });
  for (const r of resumes) {
    for (const src of [r.original, r.aiGenerated]) {
      if (src?.publicId) await bestEffort('cloudinary resume', () => deleteFromCloudinary(src.publicId, 'raw'));
      if (src?.fileName) await bestEffort('local resume', async () => removeLocalResume(src.fileName));
    }
  }
  await Resume.deleteMany({ student: profile._id });

  if (profile.personalInfo?.profilePicture?.publicId) {
    await bestEffort('cloudinary avatar', () =>
      deleteFromCloudinary(profile.personalInfo.profilePicture.publicId)
    );
  }

  // Employers' pipelines must not keep waiting on someone who has left.
  await Application.updateMany(
    { student: profile._id, status: { $in: OPEN_APPLICATION_STATES } },
    { $set: { status: 'withdrawn' } }
  );

  // Anonymise instead of deleting so existing applications stay structurally valid.
  await StudentProfile.updateOne(
    { _id: profile._id },
    {
      $set: {
        personalInfo: { firstName: 'Deleted', lastName: 'User' },
        education: [],
        skills: [],
        experience: [],
        status: 'hidden',
        visibility: 'private',
        university: null,
      },
      $unset: { bio: 1, headline: 1, socialLinks: 1, universityJoinedAt: 1, preferences: 1 },
    }
  );
}

async function eraseOrganization(user) {
  const org = await OrganizationProfile.findOne({ user: user._id });
  if (!org) return;

  // Nothing of theirs should stay open to applicants.
  await Internship.updateMany(
    { organization: org._id, status: { $in: ['draft', 'active', 'paused'] } },
    { $set: { status: 'closed' } }
  );
  await CompanyVerification.deleteMany({ organization: org._id });

  if (org.companyInfo?.logo?.publicId) {
    await bestEffort('cloudinary logo', () => deleteFromCloudinary(org.companyInfo.logo.publicId));
  }
  if (org.companyInfo?.coverImage?.publicId) {
    await bestEffort('cloudinary cover', () => deleteFromCloudinary(org.companyInfo.coverImage.publicId));
  }

  // companyInfo.name is unique; replace it so the name is freed and identity removed.
  await OrganizationProfile.updateOne(
    { _id: org._id },
    {
      $set: {
        'companyInfo.name': `Deleted organization ${String(org._id).slice(-6)}`,
        'contactInfo.primaryEmail': 'deleted@deleted.invalid',
      },
      $unset: { 'companyInfo.logo': 1, 'companyInfo.coverImage': 1, 'companyInfo.legalName': 1 },
    }
  );
}

async function eraseUniversity(user) {
  const uni = await University.findOne({ user: user._id });
  if (!uni) return;
  await StudentProfile.updateMany(
    { university: uni._id },
    { $set: { university: null }, $unset: { universityJoinedAt: 1 } }
  );
  await University.deleteOne({ _id: uni._id });
}

/**
 * Erase/anonymise everything personal about `user`, then disable the login.
 * `user` is a User document (any role except admin).
 */
export async function eraseAccount(user) {
  if (user.role === 'student') await eraseStudent(user);
  if (user.role === 'organization') await eraseOrganization(user);
  if (user.role === 'university') await eraseUniversity(user);

  await Promise.all([
    SavedInternship.deleteMany({ student: user._id }),
    Notification.deleteMany({ user: user._id }),
    ReferralCode.deleteMany({ user: user._id }),
    Referral.deleteMany({ $or: [{ referrer: user._id }, { referred: user._id }] }),
  ]);

  // Last step: make the credentials unusable and free the email address.
  const unusablePassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        isActive: false,
        isVerified: false,
        email: `deleted-${user._id}@deleted.invalid`,
        password: unusablePassword,
        deletedAt: new Date(),
      },
      $unset: {
        verificationToken: 1,
        verificationExpires: 1,
        resetPasswordToken: 1,
        resetPasswordExpires: 1,
      },
    }
  );
}
