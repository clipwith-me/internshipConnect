// Regression tests for the security helpers in src/utils/security.js.
import { jest } from '@jest/globals';
import { escapeRegex, validatePagination } from '../src/utils/security.js';
import {
  safeEqual,
  toStringList,
  requireCampaignKey,
  canAccessResume,
  canTransitionApplication,
} from '../src/utils/requestSafety.js';

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('escapeRegex', () => {
  test('escapes every regex metacharacter so input matches literally', () => {
    const input = '.*+?^${}()|[]\\';
    const rx = new RegExp(escapeRegex(input));
    expect(rx.test(input)).toBe(true);
    expect(rx.test('anything else')).toBe(false);
  });

  test('neutralises catastrophic-backtracking input (ReDoS)', () => {
    const evil = '(a+)+$';
    const rx = new RegExp(escapeRegex(evil), 'i');
    const subject = 'a'.repeat(50000) + '!';
    const start = Date.now();
    rx.test(subject);
    expect(Date.now() - start).toBeLessThan(200);
  });

  test('tolerates null/undefined', () => {
    expect(escapeRegex(undefined)).toBe('');
    expect(escapeRegex(null)).toBe('');
  });
});

describe('safeEqual', () => {
  test('true only for identical strings', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
  test('never throws on non-strings', () => {
    expect(safeEqual(undefined, 'abc')).toBe(false);
    expect(safeEqual({}, [])).toBe(false);
  });
});

describe('validatePagination (used by searchStudents)', () => {
  test('falls back for NaN, zero, negative', () => {
    expect(validatePagination('abc', 'abc')).toMatchObject({ page: 1, limit: 10, skip: 0 });
    expect(validatePagination('-5', '0').page).toBe(1);
  });
  test('clamps limit to max and computes skip', () => {
    expect(validatePagination('2', '9999', 50)).toMatchObject({ page: 2, limit: 50, skip: 50 });
  });
});

describe('toStringList', () => {
  test('handles comma strings and arrays, drops non-strings', () => {
    expect(toStringList('a, b ,c')).toEqual(['a', 'b', 'c']);
    expect(toStringList(['x', ' y ', 5, { $ne: 1 }])).toEqual(['x', 'y']);
    expect(toStringList(undefined)).toEqual([]);
  });
});

describe('requireCampaignKey (owner-only bulk email trigger)', () => {
  const OLD = process.env.CAMPAIGN_SECRET;
  afterEach(() => {
    if (OLD === undefined) delete process.env.CAMPAIGN_SECRET;
    else process.env.CAMPAIGN_SECRET = OLD;
  });

  test('is disabled (404) when CAMPAIGN_SECRET is unset - no default credential', () => {
    delete process.env.CAMPAIGN_SECRET;
    const res = mockRes();
    const next = jest.fn();
    // The previously hardcoded fallback must NOT work any more.
    requireCampaignKey({ headers: { 'x-campaign-key': 'ic-campaign-2025' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  test('is disabled when the configured secret is too short to be safe', () => {
    process.env.CAMPAIGN_SECRET = 'short';
    const res = mockRes();
    const next = jest.fn();
    requireCampaignKey({ headers: { 'x-campaign-key': 'short' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).not.toHaveBeenCalled();
  });

  test('rejects a wrong key with 403', () => {
    process.env.CAMPAIGN_SECRET = 'a-very-long-random-secret-value';
    const res = mockRes();
    const next = jest.fn();
    requireCampaignKey({ headers: { 'x-campaign-key': 'nope' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('does not accept the key from the request body', () => {
    process.env.CAMPAIGN_SECRET = 'a-very-long-random-secret-value';
    const res = mockRes();
    const next = jest.fn();
    requireCampaignKey(
      { headers: {}, body: { campaignKey: 'a-very-long-random-secret-value' } },
      res,
      next
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('accepts the correct header key', () => {
    process.env.CAMPAIGN_SECRET = 'a-very-long-random-secret-value';
    const res = mockRes();
    const next = jest.fn();
    const req = { headers: { 'x-campaign-key': 'a-very-long-random-secret-value' } };
    requireCampaignKey(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ role: 'admin' });
  });
});

describe('canAccessResume (broken access control regression)', () => {
  test('owner student: allowed; another student: denied', () => {
    expect(canAccessResume({ role: 'student', isOwner: true })).toBe(true);
    expect(canAccessResume({ role: 'student', isOwner: false })).toBe(false);
  });

  test('organization: allowed only with an application relationship', () => {
    expect(canAccessResume({ role: 'organization', hasApplicationToOrg: true })).toBe(true);
    // Previously ANY organization could download ANY resume.
    expect(canAccessResume({ role: 'organization', hasApplicationToOrg: false })).toBe(false);
  });

  test('admin: allowed', () => {
    expect(canAccessResume({ role: 'admin' })).toBe(true);
  });

  test('university and unknown roles: denied', () => {
    expect(canAccessResume({ role: 'university', isOwner: true, hasApplicationToOrg: true })).toBe(false);
    expect(canAccessResume({ role: undefined })).toBe(false);
  });
});

describe('canTransitionApplication (hiring pipeline integrity)', () => {
  test('allows normal forward progress and skipping a stage', () => {
    expect(canTransitionApplication('submitted', 'under-review').ok).toBe(true);
    expect(canTransitionApplication('under-review', 'shortlisted').ok).toBe(true);
    expect(canTransitionApplication('submitted', 'shortlisted').ok).toBe(true);
    expect(canTransitionApplication('interview', 'offered').ok).toBe(true);
  });

  test('allows rejecting from any open stage', () => {
    for (const s of ['submitted', 'under-review', 'shortlisted', 'interview', 'offered']) {
      expect(canTransitionApplication(s, 'rejected').ok).toBe(true);
    }
  });

  test("'accepted' requires a prior offer (placements can't be invented)", () => {
    expect(canTransitionApplication('offered', 'accepted').ok).toBe(true);
    expect(canTransitionApplication('submitted', 'accepted').ok).toBe(false);
    expect(canTransitionApplication('interview', 'accepted').ok).toBe(false);
  });

  test('closed applications cannot be reopened or changed', () => {
    for (const s of ['accepted', 'rejected', 'withdrawn']) {
      expect(canTransitionApplication(s, 'under-review').ok).toBe(false);
      expect(canTransitionApplication(s, 'accepted').ok).toBe(false);
    }
    expect(canTransitionApplication('rejected', 'accepted').ok).toBe(false);
  });

  test('no backwards moves, no no-ops, employers cannot set withdrawn', () => {
    expect(canTransitionApplication('shortlisted', 'submitted').ok).toBe(false);
    expect(canTransitionApplication('interview', 'under-review').ok).toBe(false);
    expect(canTransitionApplication('submitted', 'submitted').ok).toBe(false);
    expect(canTransitionApplication('submitted', 'withdrawn').ok).toBe(false);
  });

  test('unknown statuses are rejected', () => {
    expect(canTransitionApplication('submitted', 'hired').ok).toBe(false);
    expect(canTransitionApplication('nonsense', 'rejected').ok).toBe(false);
  });
});
