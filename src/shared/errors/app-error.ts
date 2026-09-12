/**
 * ONE error type that flows through the whole app.
 *
 * Why it matters: without a standard shape the UI has to guess —
 * is this an AxiosError? a plain Error? a string? an object {message}?
 * The interceptor in core/api translates EVERYTHING into AppError, so components
 * only ever deal with a single shape.
 */
export type AppErrorKind =
  | 'network' // offline, timeout
  | 'auth' // 401/403 — needs to sign in again
  | 'validation' // 400/422 — bad payload sent
  | 'not_found' // 404
  | 'conflict' // 409 — e.g. the item just sold out
  | 'server' // 5xx
  | 'unknown';

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(params: {
    kind: AppErrorKind;
    code: string;
    message: string;
    details?: Record<string, unknown>;
  }) {
    super(params.message);
    this.name = 'AppError';
    this.kind = params.kind;
    this.code = params.code;
    this.details = params.details;
  }

  /** Retrying makes sense for network/server errors; for validation errors it does not. */
  get isRetryable(): boolean {
    return this.kind === 'network' || this.kind === 'server';
  }

  static from(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }
    return new AppError({
      kind: 'unknown',
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Đã có lỗi xảy ra',
    });
  }
}

/** Message shown to the user — never leaks technical detail. */
export const toUserMessage = (error: unknown): string => {
  const appError = AppError.from(error);
  switch (appError.kind) {
    case 'network':
      return 'Mất kết nối mạng. Vui lòng thử lại.';
    case 'auth':
      return 'Phiên đăng nhập đã hết hạn.';
    case 'not_found':
      return 'Không tìm thấy nội dung.';
    case 'server':
      return 'Hệ thống đang bận. Vui lòng thử lại sau ít phút.';
    default:
      return appError.message;
  }
};
