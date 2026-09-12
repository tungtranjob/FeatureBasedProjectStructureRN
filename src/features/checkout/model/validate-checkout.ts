import type {Money} from '@shared/types/money';
import {formatCurrency} from '@shared/lib/format';

/**
 * Những lý do khiến KHÔNG đặt được đơn.
 *
 * Dùng union có phân biệt (discriminated union) thay vì mảng string, để UI
 * xử lý được từng loại khác nhau: thiếu địa chỉ thì mở màn chọn địa chỉ,
 * còn chưa đủ đơn tối thiểu thì chỉ hiện thông báo.
 */
export type CheckoutBlocker =
  | {kind: 'empty-cart'; message: string}
  | {kind: 'no-address'; message: string}
  | {kind: 'restaurant-closed'; message: string}
  | {kind: 'below-min-order'; message: string; missing: Money};

export interface CheckoutValidationInput {
  itemCount: number;
  hasAddress: boolean;
  isRestaurantOpen: boolean;
  subtotal: Money;
  minOrderAmount: Money;
}

/**
 * Trả về danh sách vấn đề, THEO THỨ TỰ ƯU TIÊN xử lý.
 *
 * Thứ tự quan trọng: UI chỉ hiện vấn đề ĐẦU TIÊN trên nút đặt hàng. Đổ cả
 * 4 lỗi lên màn hình cùng lúc chỉ làm người dùng hoảng — hãy dẫn họ đi
 * từng bước một.
 */
export const validateCheckout = (
  input: CheckoutValidationInput,
): CheckoutBlocker[] => {
  const blockers: CheckoutBlocker[] = [];

  if (input.itemCount === 0) {
    blockers.push({kind: 'empty-cart', message: 'Giỏ hàng đang trống'});
    // Giỏ rỗng thì mọi kiểm tra khác đều vô nghĩa.
    return blockers;
  }

  if (!input.hasAddress) {
    blockers.push({
      kind: 'no-address',
      message: 'Vui lòng chọn địa chỉ giao hàng',
    });
  }

  if (!input.isRestaurantOpen) {
    blockers.push({
      kind: 'restaurant-closed',
      message: 'Nhà hàng hiện không nhận đơn',
    });
  }

  if (input.subtotal < input.minOrderAmount) {
    const missing = (input.minOrderAmount - input.subtotal) as Money;
    blockers.push({
      kind: 'below-min-order',
      message: `Mua thêm ${formatCurrency(missing)} để đạt đơn tối thiểu`,
      missing,
    });
  }

  return blockers;
};

export const canPlaceOrder = (input: CheckoutValidationInput): boolean =>
  validateCheckout(input).length === 0;
