import {clampToZero, minMoney, money, type Money} from '@shared/types/money';
import {formatCurrency} from '@shared/lib/format';
import type {Voucher, VoucherEligibility} from './types';

/**
 * Voucher có dùng được cho đơn này không?
 *
 * Trả về LÝ DO chứ không chỉ true/false. UI cần nói được
 * "Cần thêm 30.000đ nữa" thay vì làm mờ voucher và để user tự đoán —
 * khác biệt giữa một app dùng được và một app gây ức chế.
 *
 * Lưu ý: đây là kiểm tra PHÍA CLIENT, để hiển thị. Server vẫn kiểm tra lại
 * khi đặt đơn (xem handlers.ts). Không bao giờ tin mỗi client.
 */
export const checkEligibility = (
  voucher: Voucher,
  params: {subtotal: Money; restaurantId: string | null},
  now: Date = new Date(),
): VoucherEligibility => {
  if (new Date(voucher.expiresAt).getTime() < now.getTime()) {
    return {eligible: false, reason: 'expired', message: 'Đã hết hạn'};
  }

  if (voucher.restaurantId && voucher.restaurantId !== params.restaurantId) {
    return {
      eligible: false,
      reason: 'wrong-restaurant',
      message: 'Không áp dụng cho nhà hàng này',
    };
  }

  if (params.subtotal < voucher.minOrderAmount) {
    const missing = money(voucher.minOrderAmount - params.subtotal);
    return {
      eligible: false,
      reason: 'below-min-order',
      message: `Mua thêm ${formatCurrency(missing)} để dùng`,
    };
  }

  return {eligible: true};
};

export const isVoucherEligible = (
  voucher: Voucher,
  params: {subtotal: Money; restaurantId: string | null},
  now: Date = new Date(),
): boolean => checkEligibility(voucher, params, now).eligible;

/**
 * Số tiền được giảm.
 *
 * Trả về 0 khi voucher không hợp lệ thay vì ném lỗi: hàm này chạy trong
 * lúc render để hiện preview, mà render thì không được phép ném lỗi.
 */
export const calcDiscount = (
  voucher: Voucher | null,
  params: {subtotal: Money; deliveryFee: Money; restaurantId: string | null},
  now: Date = new Date(),
): Money => {
  if (!voucher) {
    return money(0);
  }
  if (!isVoucherEligible(voucher, params, now)) {
    return money(0);
  }

  switch (voucher.discountType) {
    case 'PERCENT': {
      const raw = money(Math.round((params.subtotal * voucher.value) / 100));
      // Trần giảm giá: "giảm 20% tối đa 30k" -> đơn 500k vẫn chỉ giảm 30k.
      return voucher.maxDiscount ? minMoney(raw, voucher.maxDiscount) : raw;
    }
    case 'FIXED':
      // Không giảm quá tiền hàng, tránh tổng đơn âm.
      return clampToZero(minMoney(money(voucher.value), params.subtotal));
    case 'FREESHIP':
      return params.deliveryFee;
  }
};

/**
 * Sắp xếp: dùng được lên trước, trong đó giảm nhiều hơn lên trước.
 *
 * `now` cũng là tham số (giống các hàm trên) để test không phụ thuộc vào
 * ngày chạy test — một test xanh hôm nay và đỏ sau Tết là test tồi.
 */
export const sortVouchersForDisplay = (
  vouchers: Voucher[],
  params: {subtotal: Money; deliveryFee: Money; restaurantId: string | null},
  now: Date = new Date(),
): Voucher[] =>
  [...vouchers].sort((a, b) => {
    const aOk = isVoucherEligible(a, params, now);
    const bOk = isVoucherEligible(b, params, now);
    if (aOk !== bOk) {
      return aOk ? -1 : 1;
    }
    return calcDiscount(b, params, now) - calcDiscount(a, params, now);
  });
