import { Book } from './book.entity';

describe('Book', () => {
  it('creates a valid book', () => {
    const book = Book.create({ code: 'JK-45', title: 'HP', author: 'JKR', stock: 1 });
    expect(book.code).toBe('JK-45');
    expect(book.stock).toBe(1);
  });

  it('rejects negative stock', () => {
    expect(() => Book.create({ code: 'X', title: 'X', author: 'X', stock: -1 })).toThrow();
  });

  it('computes available quantity = stock - activeBorrowCount', () => {
    const book = Book.create({ code: 'X', title: 'X', author: 'X', stock: 3 });
    expect(book.availableQuantity(0)).toBe(3);
    expect(book.availableQuantity(2)).toBe(1);
  });

  it('clamps available quantity at 0 instead of going negative', () => {
    const book = Book.create({ code: 'X', title: 'X', author: 'X', stock: 1 });
    expect(book.availableQuantity(5)).toBe(0);
  });
});
