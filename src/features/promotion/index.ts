/**
 * PUBLIC API của feature promotion.
 *
 * Feature checkout dùng những thứ này để hiện danh sách voucher và tính
 * giảm giá. Nó KHÔNG biết voucher được lấy về từ endpoint nào, cache bao
 * lâu, hay quy tắc PERCENT có trần giảm giá ra sao.
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
