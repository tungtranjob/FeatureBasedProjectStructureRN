import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {mmkvStorage} from '@core/storage/zustand-persist';

/**
 * ⭐⭐ STORE QUAN TRỌNG NHẤT TRONG APP VỀ MẶT ĐỘ TIN CẬY.
 *
 * Nó lưu "đang có giao dịch nào dang dở" và BẮT BUỘC phải persist.
 *
 * Vì sao bắt buộc: khi người dùng bấm thanh toán MoMo, app ta bị đẩy ra nền.
 * Android trên máy RAM thấp GIẾT app ta trong lúc đó khá thường xuyên. Khi
 * người dùng quay lại, app khởi động LẠI TỪ ĐẦU — mọi state trong RAM đã mất.
 *
 * Nếu không persist: app mở lên sạch trơn, không biết có giao dịch nào đang
 * chờ. Người dùng đã bị trừ tiền nhưng app hiển thị giỏ hàng như chưa có gì
 * xảy ra. Đây là lớp bug tệ nhất trong app thanh toán.
 *
 * Persist rồi thì lúc cold start ta thấy pendingIntentId, hỏi lại server,
 * và xử lý đúng.
 */
interface PaymentState {
  pendingIntentId: string | null;
  pendingOrderId: string | null;
  /** Mốc thời gian để phát hiện giao dịch treo quá lâu. */
  startedAt: number | null;

  setPending: (params: {intentId: string; orderId: string}) => void;
  clearPending: () => void;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    set => ({
      pendingIntentId: null,
      pendingOrderId: null,
      startedAt: null,

      setPending: ({intentId, orderId}) =>
        set({
          pendingIntentId: intentId,
          pendingOrderId: orderId,
          startedAt: Date.now(),
        }),

      clearPending: () =>
        set({pendingIntentId: null, pendingOrderId: null, startedAt: null}),
    }),
    {
      name: 'foodgo.payment',
      storage: createJSONStorage(() => mmkvStorage),
      version: 1,
    },
  ),
);

export const selectPendingIntentId = (state: PaymentState) =>
  state.pendingIntentId;
export const selectPendingOrderId = (state: PaymentState) =>
  state.pendingOrderId;
