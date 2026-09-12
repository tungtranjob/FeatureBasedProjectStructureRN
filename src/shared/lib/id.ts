/**
 * Sinh id phía client (cho dòng giỏ hàng, idempotency key...).
 *
 * Không dùng uuid package để khỏi thêm dependency — với mục đích này thì
 * random + timestamp là đủ. Nếu cần chuẩn UUID v4 thật (VD: gửi lên server
 * làm khoá chính) thì hãy thay bằng `react-native-uuid`.
 */
export const generateId = (prefix = 'id'): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
