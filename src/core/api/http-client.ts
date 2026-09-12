import {AppError} from '@shared/errors/app-error';
import {env} from '../config/env';
import {logger} from '../logger/logger';
import {authTokenBridge} from './auth-token';
import './mock/handlers'; // side-effect: đăng ký toàn bộ route mock
import {
  handleMockRequest,
  MockHttpError,
  type HttpMethod,
} from './mock/mock-server';

/**
 * HTTP CLIENT — CỬA DUY NHẤT RA MẠNG.
 *
 * Mọi feature gọi API qua đây. Không feature nào được gọi fetch() trực tiếp.
 * Nhờ vậy 4 việc dưới đây làm MỘT LẦN thay vì lặp lại ở 40 chỗ:
 *   1. Gắn header Authorization.
 *   2. Dịch mọi loại lỗi về một kiểu AppError duy nhất.
 *   3. Log request (bật ở dev).
 *   4. Bật/tắt mock bằng đúng một cờ cấu hình.
 */

const request = async <T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<T> => {
  try {
    if (env.useMockApi) {
      return (await handleMockRequest(method, path, body)) as T;
    }
    return await realRequest<T>(method, path, body);
  } catch (error) {
    throw normalizeError(error, `${method} ${path}`);
  }
};

const realRequest = async <T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
): Promise<T> => {
  const token = authTokenBridge.getToken();

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new MockHttpError(
      response.status,
      (payload as {code?: string}).code ?? 'HTTP_ERROR',
      (payload as {message?: string}).message ?? response.statusText,
    );
  }

  // 204 No Content không có body để parse.
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
};

/** Dịch MỌI loại lỗi (mock, fetch, parse...) về AppError. */
const normalizeError = (error: unknown, context: string): AppError => {
  if (error instanceof MockHttpError) {
    if (error.status === 401 || error.status === 403) {
      // Hết phiên -> báo cho auth feature biết để đăng xuất.
      authTokenBridge.notifyUnauthorized();
    }
    const appError = new AppError({
      kind: statusToKind(error.status),
      code: error.code,
      message: error.message,
    });
    logger.warn('Http', context, appError.code, appError.message);
    return appError;
  }

  // TypeError từ fetch = mất mạng / DNS lỗi / server không phản hồi.
  if (error instanceof TypeError) {
    return new AppError({
      kind: 'network',
      code: 'NETWORK_ERROR',
      message: 'Không kết nối được máy chủ',
    });
  }

  logger.error('Http', context, error);
  return AppError.from(error);
};

const statusToKind = (status: number) => {
  if (status === 401 || status === 403) {
    return 'auth' as const;
  }
  if (status === 404) {
    return 'not_found' as const;
  }
  if (status === 409) {
    return 'conflict' as const;
  }
  if (status === 400 || status === 422) {
    return 'validation' as const;
  }
  if (status >= 500) {
    return 'server' as const;
  }
  return 'unknown' as const;
};

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

/** Ghép query string, bỏ qua giá trị rỗng/undefined. */
export const withQuery = (
  path: string,
  params: Record<string, string | number | boolean | null | undefined>,
): string => {
  const pairs = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    );
  return pairs.length > 0 ? `${path}?${pairs.join('&')}` : path;
};
