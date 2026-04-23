import { Member } from './member.entity';

describe('Member', () => {
  const NOW = new Date('2026-04-21T00:00:00.000Z');

  it('is not penalized when penalizedUntil is null', () => {
    const m = Member.create({ code: 'M001', name: 'A' });
    expect(m.isPenalized(NOW)).toBe(false);
  });

  it('is penalized when penalizedUntil is in the future', () => {
    const future = new Date(NOW.getTime() + 60_000);
    const m = Member.create({ code: 'M001', name: 'A', penalizedUntil: future });
    expect(m.isPenalized(NOW)).toBe(true);
  });

  it('is not penalized when penalizedUntil has already passed', () => {
    const past = new Date(NOW.getTime() - 60_000);
    const m = Member.create({ code: 'M001', name: 'A', penalizedUntil: past });
    expect(m.isPenalized(NOW)).toBe(false);
  });

  it('penalize(3) sets penalizedUntil to now + 3 days', () => {
    const m = Member.create({ code: 'M001', name: 'A' });
    m.penalize(3, NOW);
    const expected = new Date(NOW);
    expected.setDate(expected.getDate() + 3);
    expect(m.penalizedUntil!.toISOString()).toBe(expected.toISOString());
  });
});
