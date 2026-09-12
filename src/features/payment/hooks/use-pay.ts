import {useCallback, useState} from 'react';
import {logger} from '@core/logger/logger';
import {resolveProvider} from '../providers';
import {usePaymentStore} from '../store/payment.store';
import type {PaymentFlowStatus, PaymentIntent} from '../model/types';

/**
 * Khởi động thanh toán cho một payment intent đã có.
 *
 * ⚠️ THỨ TỰ CÁC BƯỚC Ở ĐÂY KHÔNG ĐƯỢC PHÉP ĐỔI.
 *
 * Ta ghi pendingIntentId xuống đĩa TRƯỚC khi gọi provider.pay(). Vì sao:
 * provider.pay() có thể làm app rời đi NGAY LẬP TỨC (Linking.openURL).
 * Nếu ghi sau, trong khoảnh khắc đó app đã ở nền và dòng code ghi store
 * có thể không bao giờ chạy -> mất dấu giao dịch.
 *
 * Quy tắc tổng quát: mọi thứ cần sống sót qua việc rời app phải được ghi
 * xuống đĩa TRƯỚC khi rời đi.
 */
export function useInitiatePayment() {
  const [status, setStatus] = useState<PaymentFlowStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const setPending = usePaymentStore(state => state.setPending);
  const clearPending = usePaymentStore(state => state.clearPending);

  const pay = useCallback(
    async (intent: PaymentIntent) => {
      setError(null);
      setStatus('initiating');

      const provider = resolveProvider(intent.method);

      try {
        const available = await provider.isAvailable();
        if (!available) {
          setStatus('failed');
          setError(`Không dùng được ${intent.method} trên thiết bị này`);
          return {status: 'aborted' as const};
        }

        // ⭐ GHI XUỐNG ĐĨA TRƯỚC KHI CÓ THỂ RỜI APP.
        setPending({intentId: intent.id, orderId: intent.orderId});

        const result = await provider.pay(intent);

        if (result.status === 'aborted') {
          clearPending();
          setStatus('failed');
          setError(result.reason);
        } else if (result.status === 'completed') {
          // COD: không có gì để chờ.
          clearPending();
          setStatus('succeeded');
        } else {
          // Đã rời app. Từ giờ use-payment-return.ts tiếp quản.
          setStatus('redirected');
        }

        return result;
      } catch (caught) {
        logger.error('Payment', 'Khởi động thanh toán thất bại', caught);
        clearPending();
        setStatus('failed');
        setError('Không khởi động được thanh toán');
        return {status: 'aborted' as const};
      }
    },
    [setPending, clearPending],
  );

  return {pay, status, error, setStatus};
}
