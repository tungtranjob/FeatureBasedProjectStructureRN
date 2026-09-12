import {http} from '@core/api/http-client';
import type {LoginResponseDto, UserDto} from '@core/api/contracts';
import {asId} from '@shared/types/id';
import type {UserId} from '@shared/types/id';
import type {AuthUser, Session} from '../model/types';

/**
 * The auth feature's API LAYER: network calls + translating DTOs into domain models.
 *
 * Everything grubby about the protocol (field names, string types) stops here.
 * Above this layer the app only deals with `Session` and `AuthUser`.
 */

const toAuthUser = (dto: UserDto): AuthUser => ({
  id: asId<UserId>(dto.id),
  name: dto.name,
  phone: dto.phone,
  email: dto.email,
  avatarUrl: dto.avatarUrl,
});

export const authApi = {
  async login(params: {phone: string; otp: string}): Promise<Session> {
    const dto = await http.post<LoginResponseDto>('/auth/login', params);
    return {
      accessToken: dto.accessToken,
      refreshToken: dto.refreshToken,
      user: toAuthUser(dto.user),
    };
  },
};
