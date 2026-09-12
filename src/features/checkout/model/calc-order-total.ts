import {clampToZero, money, type Money} from '@shared/types/money';
import type {FeeBreakdown} from '@features/order';

/**
 * ⚠️ TÍNH PHÍ Ở PHÍA CLIENT — CHỈ ĐỂ HIỂN THỊ TỨC THÌ.
 *
 * Logic này TRÙNG với logic ở server (xem core/api/mock/handlers.ts).
 * Trùng lặp có chủ đích, và cần hiểu rõ vì sao:
 *
 *   Vì sao vẫn tính ở client: người dùng bật/tắt voucher hay đổi số lượng
 *   phải thấy tổng tiền đổi NGAY LẬP TỨC. Chờ round-trip mạng 300ms mỗi
 *   lần chạm là trải nghiệm tệ.
 *
 *   Vì sao server VẪN PHẢI tính lại: con số từ client không bao giờ đáng
 *   tin. Ai cũng sửa được request. Đơn hàng thật luôn dùng số của server.
 *
 *   Khi hai bên lệch nhau: số của SERVER thắng. Xem use-checkout-draft.ts —
 *   nó ưu tiên bảng phí do server báo giá ngay khi có.
 *
 * Đây là mẫu "optimistic UI": đoán trước cho mượt, nhưng luôn nhường sự
 * thật cho server.
 */

const SERVICE_FEE_RATE = 0.03;
const SERVICE_FEE_CAP = 10000;

export const calcServiceFee = (subtotal: Money): Money =>
  money(Math.min(Math.round(subtotal * SERVICE_FEE_RATE), SERVICE_FEE_CAP));

export const calcOrderTotal = (params: {
  subtotal: Money;
  deliveryFee: Money;
  discount: Money;
}): FeeBreakdown => {
  const serviceFee = calcServiceFee(params.subtotal);
  const total = clampToZero(
    money(
      params.subtotal + params.deliveryFee + serviceFee - params.discount,
    ),
  );

  return {
    subtotal: params.subtotal,
    deliveryFee: params.deliveryFee,
    serviceFee,
    discount: params.discount,
    total,
  };
};

/** Bảng phí rỗng — dùng khi chưa có dữ liệu, tránh phải xử lý null ở UI. */
export const EMPTY_FEES: FeeBreakdown = {
  subtotal: money(0),
  deliveryFee: money(0),
  serviceFee: money(0),
  discount: money(0),
  total: money(0),
};
