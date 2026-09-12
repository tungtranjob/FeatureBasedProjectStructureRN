import {clampToZero, minMoney, money, type Money} from '@shared/types/money';
import {formatCurrency} from '@shared/lib/format';
import type {Voucher, VoucherEligibility} from './types';

/**
 * Can this voucher be used on this order?
 *
 * Returns a REASON rather than just true/false. The UI needs to be able to say
 * "Cần thêm 30.000đ nữa" instead of dimming the voucher and leaving the user to guess —
 * the difference between a usable app and an infuriating one.
 *
 * Note: this is a CLIENT-SIDE check, for display. The server checks again when the
 * order is placed (see handlers.ts). Never trust the client alone.
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
 * The discounted amount.
 *
 * Returns 0 for an invalid voucher rather than throwing: this function runs during
 * render to show a preview, and render must never throw.
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
      // The discount cap: "20% off up to 30k" -> a 500k order still only gets 30k off.
      return voucher.maxDiscount ? minMoney(raw, voucher.maxDiscount) : raw;
    }
    case 'FIXED':
      // Never discount more than the item total, so the order cannot go negative.
      return clampToZero(minMoney(money(voucher.value), params.subtotal));
    case 'FREESHIP':
      return params.deliveryFee;
  }
};

/**
 * Ordering: usable vouchers first, and among those, the biggest discount first.
 *
 * `now` is a parameter too (like the functions above) so tests do not depend on the
 * date they run — a test that is green today and red after New Year is a bad test.
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
