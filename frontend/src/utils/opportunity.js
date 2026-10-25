// Kinds of opportunity an employer can post. Listings created before this field
// existed have no value and are treated as internships.
export const OPPORTUNITY_TYPES = [
  { value: 'internship', label: 'Internship' },
  { value: 'job', label: 'Job' },
  { value: 'graduate-programme', label: 'Graduate programme' },
  { value: 'apprenticeship', label: 'Apprenticeship' },
  { value: 'volunteering', label: 'Volunteering' },
  { value: 'campus-role', label: 'Campus role' },
  { value: 'other', label: 'Other' },
];

export const getOpportunityType = (listing) => listing?.opportunityType || 'internship';

export const opportunityLabel = (listing) => {
  const value = getOpportunityType(listing);
  return OPPORTUNITY_TYPES.find((t) => t.value === value)?.label || 'Opportunity';
};
