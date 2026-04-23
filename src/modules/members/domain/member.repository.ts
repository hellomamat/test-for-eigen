import { Member } from './member.entity';

export const MEMBER_REPOSITORY = Symbol('MEMBER_REPOSITORY');

export interface MemberQueryOptions {
  search?: string;
}

export interface MemberRepository {
  findAll(options?: MemberQueryOptions): Promise<Member[]>;
  findByCode(code: string): Promise<Member | null>;
  save(member: Member): Promise<Member>;
  deleteByCode(code: string): Promise<void>;
}
