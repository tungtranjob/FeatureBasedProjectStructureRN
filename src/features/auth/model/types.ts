import type {UserId} from '@shared/types/id';

/**
 * DOMAIN MODEL của feature auth.
 *
 * So với UserDto (contracts.ts): id ở đây là `UserId` (branded) chứ không
 * phải string trần, và ta bỏ hẳn những field UI không dùng. Đây là lợi ích
 * cụ thể của việc tách DTO và model.
 */
export interface AuthUser {
  id: UserId;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export type AuthStatus = 'unauthenticated' | 'authenticated';
