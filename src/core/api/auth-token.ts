/**
 * CẦU NỐI TOKEN GIỮA core/ VÀ features/auth.
 *
 * Vấn đề: http-client (core) cần access token để gắn header Authorization.
 * Nhưng token do auth store (feature) nắm giữ, mà core KHÔNG ĐƯỢC import
 * feature — làm vậy là phá vỡ chiều phụ thuộc và tạo import vòng.
 *
 * Giải pháp: đảo ngược phụ thuộc (dependency inversion). core định nghĩa
 * "khe cắm" này, còn app/bootstrap là nơi cắm auth store vào. core vẫn
 * không biết auth store tồn tại, nó chỉ biết có một hàm trả về string.
 */
type TokenProvider = () => string | null;

let provider: TokenProvider = () => null;
let onUnauthorized: () => void = () => {};

export const authTokenBridge = {
  /** Gọi ở app/bootstrap, truyền vào hàm đọc token từ auth store. */
  setTokenProvider(next: TokenProvider): void {
    provider = next;
  },
  /** Gọi khi server trả 401 — auth feature sẽ đăng xuất người dùng. */
  setUnauthorizedHandler(next: () => void): void {
    onUnauthorized = next;
  },
  getToken: (): string | null => provider(),
  notifyUnauthorized: (): void => onUnauthorized(),
};
