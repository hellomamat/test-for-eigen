import { Book } from './book.entity';

export const BOOK_REPOSITORY = Symbol('BOOK_REPOSITORY');

export interface BookQueryOptions {
  search?: string;
  available?: boolean;
  skip?: number;
  take?: number;
}

export interface BookRepository {
  findAll(options?: BookQueryOptions): Promise<Book[]>;
  count(options?: Omit<BookQueryOptions, 'skip' | 'take'>): Promise<number>;
  findByCode(code: string): Promise<Book | null>;
  save(book: Book): Promise<Book>;
  deleteByCode(code: string): Promise<void>;
}
