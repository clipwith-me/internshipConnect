import Internship from '../src/models/Internship.js';

describe('Internship virtuals', () => {
  // Regression: the apply endpoint populates `internship` with only
  // "title organization"; serialising that partial document threw because
  // compensationDisplay assumed compensation.type was always present.
  test('compensationDisplay does not throw on a partially selected document', () => {
    const partial = new Internship({ title: 'Partial' });
    expect(() => partial.toJSON({ virtuals: true })).not.toThrow();
    expect(partial.compensationDisplay).toBe('Not specified');
  });

  test('compensationDisplay still formats real amounts', () => {
    const doc = new Internship({
      compensation: { type: 'paid', amount: { min: 100, max: 200, currency: 'USD' } },
    });
    expect(doc.compensationDisplay).toBe('$100 - $200');
  });
});
