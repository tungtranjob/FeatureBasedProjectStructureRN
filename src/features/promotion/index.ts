/**
 * The promotion feature's PUBLIC API.
 *
 * The checkout feature uses these to list vouchers and compute the discount.
 * It does NOT know which endpoint vouchers come from, how long they are cached,
 * or how the PERCENT rule caps the discount.
 */
export {useVouchers} from './api/promotion.queries';
export {VoucherCard} from './components/VoucherCard';
export {
  calcDiscount,
  checkEligibility,
  isVoucherEligible,
  sortVouchersForDisplay,
} from './model/voucher-rules';
export type {Voucher, DiscountType, VoucherEligibility} from './model/types';
