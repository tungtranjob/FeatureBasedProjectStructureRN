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
  /** null = applies to every restaurant. */
  restaurantId: string | null;
  expiresAt: string;
}

/** Why a voucher cannot be used — so the UI can tell the user what to do about it. */
export type IneligibleReason =
  | 'expired'
  | 'below-min-order'
  | 'wrong-restaurant';

export type VoucherEligibility =
  | {eligible: true}
  | {eligible: false; reason: IneligibleReason; message: string};
