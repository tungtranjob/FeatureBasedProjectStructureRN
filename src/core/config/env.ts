/**
 * Cấu hình runtime — một nơi duy nhất.
 *
 * Trong dự án thật, các giá trị này đến từ react-native-config (.env) hoặc
 * từ build variant. Ở đây hardcode cho gọn, nhưng ĐIỂM QUAN TRỌNG vẫn giữ
 * nguyên: không component nào đọc thẳng process.env / Config, tất cả đi qua
 * object typed này. Nhờ vậy đổi nguồn cấu hình chỉ sửa 1 file.
 */
export const env = {
  /**
   * Bật/tắt mock API.
   *
   * Đây là công tắc cho thấy sức mạnh của việc tách tầng api/:
   * đổi `false` là toàn bộ app quay sang backend thật, KHÔNG file feature nào
   * phải sửa, vì feature chỉ biết `http.get(...)` chứ không biết dữ liệu
   * đến từ đâu.
   */
  useMockApi: true,

  apiBaseUrl: 'https://api.foodgo.vn',

  /** Scheme dùng cho deep link quay về sau khi thanh toán. */
  deeplinkScheme: 'foodgo',

  /** Mock độ trễ mạng để UI loading/skeleton được test thật sự. */
  mock: {
    minLatencyMs: 250,
    maxLatencyMs: 700,
    /**
     * Tỉ lệ request mock thất bại (0 = không bao giờ lỗi).
     * Chỉnh lên 0.2 để xem ErrorView và nút "Thử lại" hoạt động ra sao.
     */
    failureRate: 0,
  },
} as const;
