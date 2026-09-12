import {sleep} from '@shared/lib/sleep';
import {env} from '../../config/env';
import {logger} from '../../logger/logger';

/**
 * MOCK SERVER CHẠY TRONG APP.
 *
 * Vì sao tự viết ~90 dòng thay vì dùng MSW:
 *  - MSW trên React Native cần cấu hình polyfill khá phiền.
 *  - Ở đây ta chỉ cần đúng 3 thứ: định tuyến, độ trễ, và lỗi giả lập.
 *  - Ít phép màu hơn -> dễ debug hơn khi dữ liệu demo cư xử lạ.
 *
 * Nó mô phỏng đủ thứ mà một backend thật có và file JSON tĩnh KHÔNG có:
 *  - Độ trễ mạng (để thấy skeleton, thấy nút bị disable lúc loading).
 *  - Mã lỗi HTTP (để test ErrorView, retry, và các nhánh thất bại).
 *  - Trạng thái thay đổi được (đặt đơn -> đơn mới xuất hiện trong lịch sử).
 */

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface MockContext {
  /** Tham số đường dẫn, VD '/restaurants/:id' -> {id: 'res_01'}. */
  params: Record<string, string>;
  /** Query string đã parse, VD '?page=2' -> {page: '2'}. */
  query: Record<string, string>;
  body: unknown;
}

type MockHandler = (ctx: MockContext) => unknown;

/** Lỗi có mã HTTP — handler ném ra để mô phỏng response 4xx/5xx. */
export class MockHttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'MockHttpError';
  }
}

interface Route {
  method: HttpMethod;
  segments: string[];
  handler: MockHandler;
}

const routes: Route[] = [];

/** Đăng ký route, VD: route('GET', '/restaurants/:id', ctx => ...) */
export const route = (
  method: HttpMethod,
  pattern: string,
  handler: MockHandler,
): void => {
  routes.push({method, segments: splitPath(pattern), handler});
};

const splitPath = (path: string): string[] =>
  path.split('/').filter(segment => segment.length > 0);

const parseQuery = (search: string): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!search) {
    return result;
  }
  for (const pair of search.split('&')) {
    const [key, value = ''] = pair.split('=');
    if (key) {
      result[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  return result;
};

const matchRoute = (
  method: HttpMethod,
  pathSegments: string[],
): {handler: MockHandler; params: Record<string, string>} | null => {
  for (const candidate of routes) {
    if (candidate.method !== method) {
      continue;
    }
    if (candidate.segments.length !== pathSegments.length) {
      continue;
    }

    const params: Record<string, string> = {};
    let matched = true;

    for (let i = 0; i < candidate.segments.length; i += 1) {
      const patternSegment = candidate.segments[i] as string;
      const actualSegment = pathSegments[i] as string;

      if (patternSegment.startsWith(':')) {
        params[patternSegment.slice(1)] = actualSegment;
      } else if (patternSegment !== actualSegment) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return {handler: candidate.handler, params};
    }
  }
  return null;
};

const randomLatency = (): number => {
  const {minLatencyMs, maxLatencyMs} = env.mock;
  return minLatencyMs + Math.random() * (maxLatencyMs - minLatencyMs);
};

/**
 * Điểm vào duy nhất: http-client gọi hàm này khi env.useMockApi = true.
 * Chữ ký giống fetch để lúc chuyển sang backend thật gần như không đổi gì.
 */
export const handleMockRequest = async (
  method: HttpMethod,
  url: string,
  body?: unknown,
): Promise<unknown> => {
  await sleep(randomLatency());

  // Lỗi ngẫu nhiên để kiểm chứng UI xử lý lỗi. Bật bằng env.mock.failureRate.
  if (Math.random() < env.mock.failureRate) {
    throw new MockHttpError(503, 'MOCK_FLAKY', 'Mock: lỗi mạng giả lập');
  }

  const [rawPath = '', rawQuery = ''] = url.split('?');
  const matched = matchRoute(method, splitPath(rawPath));

  if (!matched) {
    throw new MockHttpError(
      404,
      'ROUTE_NOT_FOUND',
      `Mock chưa có route ${method} ${rawPath}`,
    );
  }

  logger.debug('MockServer', `${method} ${url}`);

  return matched.handler({
    params: matched.params,
    query: parseQuery(rawQuery),
    body,
  });
};
