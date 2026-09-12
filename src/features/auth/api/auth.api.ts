import {http} from '@core/api/http-client';
import type {LoginResponseDto, UserDto} from '@core/api/contracts';
import {asId} from '@shared/types/id';
import type {UserId} from '@shared/types/id';
import type {AuthUser, Session} from '../model/types';

/**
 * TẦNG API của feature auth: gọi mạng + dịch DTO sang domain model.
 *
 * Mọi thứ bẩn thỉu của giao thức (tên field, kiểu string) dừng lại ở đây.
 * Từ tầng này trở lên, app chỉ làm việc với `Session` và `AuthUser`.
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
