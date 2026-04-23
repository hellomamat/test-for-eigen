import { BusinessRuleViolation } from '../../../shared/exceptions/domain.exception';

export interface BorrowingProps {
  id?: string;
  memberCode: string;
  bookCode: string;
  borrowedAt: Date;
  returnedAt?: Date | null;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const MAX_BORROW_DAYS = 7;

export class Borrowing {
  private constructor(
    public readonly id: string | undefined,
    public readonly memberCode: string,
    public readonly bookCode: string,
    public readonly borrowedAt: Date,
    private _returnedAt: Date | null,
  ) {}

  static create(props: BorrowingProps): Borrowing {
    return new Borrowing(
      props.id,
      props.memberCode,
      props.bookCode,
      props.borrowedAt,
      props.returnedAt ?? null,
    );
  }

  get returnedAt(): Date | null {
    return this._returnedAt;
  }

  isActive(): boolean {
    return this._returnedAt === null;
  }

  daysBorrowed(now: Date): number {
    const end = this._returnedAt ?? now;
    const diff = end.getTime() - this.borrowedAt.getTime();
    return Math.floor(diff / MS_PER_DAY);
  }

  isOverdue(now: Date): boolean {
    return this.daysBorrowed(now) > MAX_BORROW_DAYS;
  }

  /** Batas akhir tanpa denda: borrowedAt + MAX_BORROW_DAYS hari. */
  get dueAt(): Date {
    const d = new Date(this.borrowedAt.getTime());
    d.setDate(d.getDate() + MAX_BORROW_DAYS);
    return d;
  }

  markReturned(now: Date): void {
    if (this._returnedAt !== null) {
      throw new BusinessRuleViolation('This borrowing has already been returned');
    }
    this._returnedAt = now;
  }
}
