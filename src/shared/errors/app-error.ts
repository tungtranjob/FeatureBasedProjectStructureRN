/**
 * Một loại lỗi DUY NHẤT chạy xuyên app.
 *
 * Tại sao quan trọng: nếu không chuẩn hoá, UI sẽ phải đoán mò —
 * lỗi này là AxiosError? là Error thường? là string? là object {message}?
 * Interceptor ở core/api sẽ dịch MỌI thứ về AppError, nên component chỉ
 * cần biết đúng một hình dạng.
 */
export type AppErrorKind =
  | 'network' // mất mạng, timeout
  | 'auth' // 401/403 — cần đăng nhập lại
  | 'validation' // 400/422 — dữ liệu gửi lên sai
  | 'not_found' // 404
  | 'conflict' // 409 — VD: món vừa hết hàng
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

  /** Lỗi mạng/server thì retry có ý nghĩa; lỗi validation thì không. */
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

/** Thông điệp hiển thị cho người dùng — không lộ chi tiết kỹ thuật. */
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
