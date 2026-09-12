import {AppError} from '@shared/errors/app-error';
import {env} from '../config/env';
import {logger} from '../logger/logger';
import {authTokenBridge} from './auth-token';
import './mock/handlers'; // side effect: registers every mock route
import {
  handleMockRequest,
  MockHttpError,
  type HttpMethod,
} from './mock/mock-server';

/**
 * HTTP CLIENT — THE ONLY DOOR TO THE NETWORK.
 *
 * Every feature calls the API through here. No feature calls fetch() directly.
 * That way the four things below happen ONCE instead of being repeated in 40 places:
 *   1. Attaching the Authorization header.
 *   2. Translating every kind of error into a single AppError type.
 *   3. Request logging (on in dev).
 *   4. Turning the mock on/off with one config flag.
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

  // A 204 No Content has no body to parse.
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
};

/** Translates EVERY kind of error (mock, fetch, parse, ...) into an AppError. */
const normalizeError = (error: unknown, context: string): AppError => {
  if (error instanceof MockHttpError) {
    if (error.status === 401 || error.status === 403) {
      // Session expired -> tell the auth feature to sign the user out.
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

  // A TypeError from fetch = offline / DNS failure / server not responding.
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

/** Builds a query string, skipping empty/undefined values. */
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
