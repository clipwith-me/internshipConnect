// Public view of an employer's verification.
//
// A "verified" badge tells students that InternshipConnect reviewed the
// employer's registration document. Only the review flow sets verifiedBy, so a
// profile marked verified without it (older seed or test data) is NOT shown as
// verified. The reviewer's id itself is never exposed.

export const isPubliclyVerified = (verification) =>
  verification?.status === 'verified' && Boolean(verification?.verifiedBy);

/** JSON for a populated listing with organization.verification reduced to what is safe to show. */
export const withPublicVerification = (listing) => {
  const json = typeof listing?.toJSON === 'function' ? listing.toJSON() : { ...listing };
  const org = json.organization;
  if (org && typeof org === 'object' && 'verification' in org) {
    json.organization = {
      ...org,
      verification: { status: isPubliclyVerified(org.verification) ? 'verified' : 'unverified' },
    };
  }
  return json;
};
