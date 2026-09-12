import type {Money} from '@shared/types/money';
import type {VoucherId} from '@shared/types/id';

export type DiscountType = 'PERCENT' | 'FIXED' | 'FREESHIP';

export interface Voucher {
  id: VoucherId;
  code: string;
  title: string;
  description: string;
  discountType: DiscountType;
  value: number;
  maxDiscount: Money | null;
  minOrderAmount: Money;
  /** null = áp dụng cho mọi nhà hàng. */
  restaurantId: string | null;
  expiresAt: string;
}

/** Vì sao voucher không dùng được — để UI nói cho user biết phải làm gì. */
export type IneligibleReason =
  | 'expired'
  | 'below-min-order'
  | 'wrong-restaurant';

export type VoucherEligibility =
  | {eligible: true}
  | {eligible: false; reason: IneligibleReason; message: string};
