/* eslint-disable no-console */

/**
 * Central logger.
 *
 * Why not call console.log everywhere: when Sentry/Datadog needs wiring in,
 * you only edit this file. Also, in production we want debug logs off but
 * error logs kept — impossible if console.log is scattered across 200 places.
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
