import { isPubliclyVerified, withPublicVerification } from '../src/utils/orgVerification.js';

describe('public employer verification', () => {
  test('requires a reviewer, so seed data marked verified is not shown as verified', () => {
    expect(isPubliclyVerified({ status: 'verified', verifiedBy: 'admin1' })).toBe(true);
    expect(isPubliclyVerified({ status: 'verified' })).toBe(false);
    expect(isPubliclyVerified({ status: 'pending', verifiedBy: 'admin1' })).toBe(false);
    expect(isPubliclyVerified(undefined)).toBe(false);
  });

  test('never exposes the reviewer id', () => {
    const out = withPublicVerification({
      title: 'x',
      organization: { name: 'Org', verification: { status: 'verified', verifiedBy: 'secret-admin-id', trustScore: 90 } },
    });
    expect(out.organization.verification).toEqual({ status: 'verified' });
    const seeded = withPublicVerification({ organization: { verification: { status: 'verified' } } });
    expect(seeded.organization.verification).toEqual({ status: 'unverified' });
  });

  test('leaves listings without a populated organisation untouched', () => {
    expect(withPublicVerification({ title: 'x', organization: 'abc123' })).toEqual({ title: 'x', organization: 'abc123' });
  });
});
