import {sleep} from '@shared/lib/sleep';
import {env} from '../../config/env';
import {logger} from '../../logger/logger';

/**
 * AN IN-APP MOCK SERVER.
 *
 * Why hand-roll ~90 lines instead of using MSW:
 *  - MSW on React Native needs fiddly polyfill configuration.
 *  - We only need three things here: routing, latency, and simulated failures.
 *  - Less magic -> easier to debug when the demo data behaves oddly.
 *
 * It simulates everything a real backend has that a static JSON file does NOT:
 *  - Network latency (so you can see skeletons and buttons disabled while loading).
 *  - HTTP error codes (to exercise ErrorView, retry, and failure branches).
 *  - Mutable state (place an order -> it shows up in the order history).
 */

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface MockContext {
  /** Path params, e.g. '/restaurants/:id' -> {id: 'res_01'}. */
  params: Record<string, string>;
  /** Parsed query string, e.g. '?page=2' -> {page: '2'}. */
  query: Record<string, string>;
  body: unknown;
}

type MockHandler = (ctx: MockContext) => unknown;

/** An error carrying an HTTP status — handlers throw it to simulate a 4xx/5xx response. */
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

/** Registers a route, e.g. route('GET', '/restaurants/:id', ctx => ...) */
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
 * The single entry point: http-client calls this when env.useMockApi = true.
 * The signature mirrors fetch so moving to a real backend changes almost nothing.
 */
export const handleMockRequest = async (
  method: HttpMethod,
  url: string,
  body?: unknown,
): Promise<unknown> => {
  await sleep(randomLatency());

  // Random failures to verify the UI handles errors. Enable via env.mock.failureRate.
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
