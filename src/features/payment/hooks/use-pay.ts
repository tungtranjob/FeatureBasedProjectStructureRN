import {useCallback, useState} from 'react';
import {logger} from '@core/logger/logger';
import {resolveProvider} from '../providers';
import {usePaymentStore} from '../store/payment.store';
import type {PaymentFlowStatus, PaymentIntent} from '../model/types';

/**
 * Starts payment for an existing payment intent.
 *
 * ⚠️ THE ORDER OF THE STEPS HERE MUST NOT BE CHANGED.
 *
 * We write pendingIntentId to disk BEFORE calling provider.pay(). Why:
 * provider.pay() can make the app leave IMMEDIATELY (Linking.openURL).
 * Writing afterwards means that by then the app is in the background and the line that
 * writes to the store may never run -> the transaction is lost.
 *
 * The general rule: anything that has to survive leaving the app must be written to
 * disk BEFORE leaving.
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

        // ⭐ WRITE TO DISK BEFORE THE APP CAN LEAVE.
        setPending({intentId: intent.id, orderId: intent.orderId});

        const result = await provider.pay(intent);

        if (result.status === 'aborted') {
          clearPending();
          setStatus('failed');
          setError(result.reason);
        } else if (result.status === 'completed') {
          // COD: there is nothing to wait for.
          clearPending();
          setStatus('succeeded');
        } else {
          // The app has left. From here on use-payment-return.ts takes over.
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
