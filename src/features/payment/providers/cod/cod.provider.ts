import type {PaymentProvider} from '../provider.types';

/**
 * PROVIDER COD — "provider rỗng".
 *
 * Tiền mặt thì chẳng có cổng thanh toán nào cả. Nhưng ta vẫn tạo provider
 * cho nó, thay vì viết `if (method === 'COD') { ... }` trong màn checkout.
 *
 * Vì sao: mọi phương thức đi qua CÙNG một đường dẫn code. Không có nhánh
 * đặc biệt nào để quên xử lý, không có màn hình nào phải biết COD là ngoại lệ.
 * Đây là mẫu Null Object.
 */
export const codProvider: PaymentProvider = {
  method: 'COD',

  async isAvailable() {
    return true;
  },

  async pay() {
    // Không có gì để mở. Đơn đã ở trạng thái CONFIRMED ngay từ server.
    return {status: 'completed'};
  },
};
