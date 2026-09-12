/* eslint-disable no-console */

/**
 * Logger tập trung.
 *
 * Lý do không gọi thẳng console.log khắp nơi: khi cần gắn Sentry/Datadog,
 * bạn chỉ sửa file này. Ngoài ra ở production ta muốn tắt log debug nhưng
 * vẫn giữ log lỗi — điều đó không làm được nếu console.log rải rác 200 chỗ.
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const ENABLED: Record<LogLevel, boolean> = {
  debug: __DEV__,
  info: __DEV__,
  warn: true,
  error: true,
};

const write = (level: LogLevel, scope: string, ...args: unknown[]): void => {
  if (!ENABLED[level]) {
    return;
  }
  const prefix = `[${level.toUpperCase()}][${scope}]`;
  if (level === 'error') {
    console.error(prefix, ...args);
  } else if (level === 'warn') {
    console.warn(prefix, ...args);
  } else {
    console.log(prefix, ...args);
  }
};

export const logger = {
  debug: (scope: string, ...args: unknown[]) => write('debug', scope, ...args),
  info: (scope: string, ...args: unknown[]) => write('info', scope, ...args),
  warn: (scope: string, ...args: unknown[]) => write('warn', scope, ...args),
  error: (scope: string, ...args: unknown[]) => write('error', scope, ...args),
};
