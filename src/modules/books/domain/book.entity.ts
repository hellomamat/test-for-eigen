export interface BookProps {
  code: string;
  title: string;
  author: string;
  stock: number;
}

export class Book {
  private constructor(
    public readonly code: string,
    public readonly title: string,
    public readonly author: string,
    public readonly stock: number,
  ) {}

  static create(props: BookProps): Book {
    if (!props.code) throw new Error('Book code is required');
    if (props.stock < 0) throw new Error('Book stock cannot be negative');
    return new Book(props.code, props.title, props.author, props.stock);
  }

  availableQuantity(activeBorrowCount: number): number {
    const available = this.stock - activeBorrowCount;
    return available < 0 ? 0 : available;
  }
}
