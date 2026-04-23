export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class BusinessRuleViolation extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleViolation';
  }
}

export class NotFoundDomainError extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundDomainError';
  }
}
