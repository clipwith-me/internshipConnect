// Form <-> API mapping and validation for internship listings.
const toDateInput = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '');

/** Build initial form values from an existing listing (edit) or defaults (create). */
export const toFormValues = (i) => ({
  opportunityType: i?.opportunityType || 'internship',
  title: i?.title || '',
  description: i?.description || '',
  requirementsText: i?.requirements?.description || '',
  skillsText: (i?.requirements?.skills || []).map((s) => s.name).filter(Boolean).join(', '),
  locationType: i?.location?.type || 'remote',
  city: i?.location?.city || '',
  country: i?.location?.country || '',
  compType: i?.compensation?.type || 'paid',
  min: i?.compensation?.amount?.min ?? '',
  max: i?.compensation?.amount?.max ?? '',
  currency: i?.compensation?.amount?.currency || 'USD',
  durationLength: i?.duration?.length || '',
  positions: i?.positions?.total || 1,
  startDate: toDateInput(i?.timeline?.startDate),
  endDate: toDateInput(i?.timeline?.endDate),
  deadline: toDateInput(i?.timeline?.applicationDeadline),
  publish: i ? i.status === 'active' : true,
});

const num = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? undefined : Number(v));

/** Convert form values to the API payload. */
export const toPayload = (v) => {
  const skills = [...new Set(v.skillsText.split(',').map((s) => s.trim()).filter(Boolean))].slice(0, 20);
  const min = num(v.min);
  const max = num(v.max);
  return {
    opportunityType: v.opportunityType,
    title: v.title.trim(),
    description: v.description.trim(),
    requirements: {
      ...(v.requirementsText.trim() && { description: v.requirementsText.trim() }),
      skills: skills.map((name) => ({ name })),
    },
    location: {
      type: v.locationType,
      ...(v.city.trim() && { city: v.city.trim() }),
      ...(v.country.trim() && { country: v.country.trim() }),
    },
    compensation: {
      type: v.compType,
      amount: {
        ...(v.compType === 'paid' && min !== undefined && { min }),
        ...(v.compType === 'paid' && max !== undefined && { max }),
        currency: v.currency,
        period: 'monthly',
      },
    },
    duration: { length: v.durationLength.trim() },
    timeline: {
      startDate: v.startDate,
      applicationDeadline: v.deadline,
      ...(v.endDate && { endDate: v.endDate }),
    },
    positions: { total: Math.max(1, Number(v.positions) || 1) },
    publish: v.publish,
  };
};

export const validateValues = (v) => {
  const e = {};
  const title = v.title.trim();
  const desc = v.description.trim();
  if (title.length < 5 || title.length > 100) e.title = 'Title must be 5–100 characters.';
  if (desc.length < 50) e.description = 'Description must be at least 50 characters.';
  if (desc.length > 5000) e.description = 'Description cannot exceed 5,000 characters.';
  if (v.requirementsText.length > 2000) e.requirementsText = 'Requirements cannot exceed 2,000 characters.';
  if (v.locationType !== 'remote' && v.city.trim().length < 2) e.city = 'City is required for on-site and hybrid roles.';
  if (!v.durationLength.trim()) e.durationLength = 'Say how long it runs, e.g. “3 months” or “Permanent”.';
  if (!v.startDate) e.startDate = 'Choose a start date.';
  if (!v.deadline) e.deadline = 'Choose an application deadline.';
  if (v.startDate && v.deadline && v.deadline > v.startDate) e.deadline = 'The deadline should be on or before the start date.';
  if (v.endDate && v.startDate && v.endDate < v.startDate) e.endDate = 'The end date must be after the start date.';
  const min = num(v.min);
  const max = num(v.max);
  if (min !== undefined && min < 0) e.min = 'Cannot be negative.';
  if (min !== undefined && max !== undefined && max < min) e.max = 'Maximum must be at least the minimum.';
  return e;
};
