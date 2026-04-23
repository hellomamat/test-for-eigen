export interface MemberProps {
  code: string;
  name: string;
  penalizedUntil?: Date | null;
}

export class Member {
  private _penalizedUntil: Date | null;

  private constructor(
    public readonly code: string,
    public readonly name: string,
    penalizedUntil: Date | null,
  ) {
    this._penalizedUntil = penalizedUntil;
  }

  static create(props: MemberProps): Member {
    if (!props.code) throw new Error('Member code is required');
    return new Member(props.code, props.name, props.penalizedUntil ?? null);
  }

  get penalizedUntil(): Date | null {
    return this._penalizedUntil;
  }

  isPenalized(now: Date = new Date()): boolean {
    return this._penalizedUntil !== null && this._penalizedUntil.getTime() > now.getTime();
  }

  penalize(durationDays: number, now: Date = new Date()): void {
    const until = new Date(now.getTime());
    until.setDate(until.getDate() + durationDays);
    this._penalizedUntil = until;
  }

  clearPenalty(): void {
    this._penalizedUntil = null;
  }
}
