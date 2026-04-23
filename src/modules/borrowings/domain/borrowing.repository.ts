import { Borrowing } from './borrowing.entity';

export const BORROWING_REPOSITORY = Symbol('BORROWING_REPOSITORY');

export interface BorrowingRepository {
  save(borrowing: Borrowing): Promise<Borrowing>;

  /** Currently-active borrowing of a given book (at most one, since stock is 1). */
  findActiveByBook(bookCode: string): Promise<Borrowing | null>;

  /** Active borrowing for a (member, book) pair. */
  findActiveByMemberAndBook(memberCode: string, bookCode: string): Promise<Borrowing | null>;

  /** All currently-active borrowings for a given member. */
  findActiveByMember(memberCode: string): Promise<Borrowing[]>;

  countActiveByMemberCode(memberCode: string): Promise<number>;

  /** Map: bookCode -> number of active borrowings. */
  countActiveByBook(): Promise<Map<string, number>>;

  /** Map: memberCode -> number of active borrowings. */
  countActiveByMember(): Promise<Map<string, number>>;
}
