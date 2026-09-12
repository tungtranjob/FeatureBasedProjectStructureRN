import {create} from 'zustand';
import type {PaymentMethod} from '@features/payment';

/**
 * NHÁP CHECKOUT — client state, và CỐ TÌNH KHÔNG PERSIST.
 *
 * So sánh với ba store còn lại trong app để thấy quyết định persist không
 * phải lúc nào cũng giống nhau:
 *
 *   cart.store      -> CÓ persist. Mất giỏ hàng là mất công chọn món.
 *   auth.store      -> CÓ persist. Bắt đăng nhập lại mỗi lần mở app là tệ.
 *   payment.store   -> CÓ persist. BẮT BUỘC, vì liên quan tới tiền.
 *   checkout.store  -> KHÔNG persist. Voucher có thể hết hạn, hình thức
 *                      thanh toán có thể không còn hợp lệ với giỏ mới. Khôi
 *                      phục lại một lựa chọn cũ chỉ gây nhầm lẫn, và giá trị
 *                      mặc định thì rẻ để tính lại.
 *
 * Quy tắc rút ra: chỉ persist thứ mà mất đi sẽ làm người dùng khó chịu HOẶC
 * gây sai lệch dữ liệu. Persist mọi thứ "cho chắc" tạo ra một lớp bug riêng
 * về dữ liệu cũ.
 */
interface CheckoutState {
  voucherId: string | null;
  paymentMethod: PaymentMethod;
  note: string;

  setVoucher: (voucherId: string | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNote: (note: string) => void;
  reset: () => void;
}

const INITIAL = {
  voucherId: null,
  paymentMethod: 'COD' as PaymentMethod,
  note: '',
};

export const useCheckoutStore = create<CheckoutState>()(set => ({
  ...INITIAL,

  setVoucher: voucherId => set({voucherId}),
  setPaymentMethod: paymentMethod => set({paymentMethod}),
  setNote: note => set({note}),
  reset: () => set(INITIAL),
}));
