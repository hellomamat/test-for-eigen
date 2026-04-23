import { Borrowing } from './borrowing.entity';

describe('Borrowing', () => {
  const borrowedAt = new Date('2026-04-01T00:00:00.000Z');

  const daysLater = (n: number) => new Date(borrowedAt.getTime() + n * 24 * 60 * 60 * 1000);

  it('starts active (returnedAt = null)', () => {
    const b = Borrowing.create({ memberCode: 'M001', bookCode: 'JK-45', borrowedAt });
    expect(b.isActive()).toBe(true);
  });

  it('is not overdue exactly at day 7', () => {
    const b = Borrowing.create({ memberCode: 'M001', bookCode: 'JK-45', borrowedAt });
    expect(b.isOverdue(daysLater(7))).toBe(false);
  });

  it('is overdue after day 7 (e.g. day 8)', () => {
    const b = Borrowing.create({ memberCode: 'M001', bookCode: 'JK-45', borrowedAt });
    expect(b.isOverdue(daysLater(8))).toBe(true);
  });

  it('markReturned flips returnedAt and rejects second return', () => {
    const b = Borrowing.create({ memberCode: 'M001', bookCode: 'JK-45', borrowedAt });
    b.markReturned(daysLater(3));
    expect(b.isActive()).toBe(false);
    expect(() => b.markReturned(daysLater(4))).toThrow();
  });
});
