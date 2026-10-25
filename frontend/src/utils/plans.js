// frontend/src/utils/plans.js
// Turns the backend's SUBSCRIPTION_PLANS feature flags into plain-language lines.
// Pricing pages render whatever the API returns, so they cannot drift from the
// plans the product actually enforces.

const limit = (n, noun) => (n === -1 ? `Unlimited ${noun}` : `Up to ${n} ${noun}`);

export const describeStudentFeatures = (f = {}) => {
  const lines = [];
  if (f.aiResumeBuilder) {
    lines.push(
      f.aiResumeLimit === -1
        ? 'Resume builder: unlimited resumes'
        : `Resume builder: up to ${f.aiResumeLimit} resumes`
    );
  }
  if (f.applicationTracking) lines.push('Application tracking');
  if (f.advancedMatching) lines.push('Advanced matching');
  else if (f.basicMatching) lines.push('Match scores for every internship');
  if (f.profileCustomization) lines.push('Profile customization');
  if (f.prioritySupport) lines.push('Priority support');
  if (f.careerCoaching) lines.push('Career coaching');
  return lines;
};

export const describeOrganizationFeatures = (f = {}) => {
  const lines = [];
  if (f.internshipListings !== undefined) lines.push(limit(f.internshipListings, 'active listings'));
  if (f.applicantTracking) lines.push('Applicant tracking');
  if (f.advancedAnalytics) lines.push('Advanced analytics');
  else if (f.basicAnalytics) lines.push('Basic analytics');
  if (f.featuredListings === -1) lines.push('Unlimited featured listings');
  else if (f.featuredListings > 0) lines.push(`${f.featuredListings} featured listings`);
  if (f.prioritySupport) lines.push('Priority support');
  if (f.dedicatedAccountManager) lines.push('Dedicated account manager');
  if (f.customBranding) lines.push('Custom branding');
  return lines;
};

export const formatPrice = (n) => (n === 0 ? 'Free' : `$${Number.isInteger(n) ? n : n.toFixed(2)}`);
