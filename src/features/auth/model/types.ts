import type {UserId} from '@shared/types/id';

/**
 * The auth feature's DOMAIN MODEL.
 *
 * Compared with UserDto (contracts.ts): the id here is `UserId` (branded) rather
 * than a bare string, and fields the UI never uses are dropped entirely. That is the
 * concrete benefit of separating DTO from model.
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
