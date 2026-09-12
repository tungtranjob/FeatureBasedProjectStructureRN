import {useCallback, useEffect, useRef, useState} from 'react';
import {Linking} from 'react-native';
import {appEventBus} from '@core/events/app-event-bus';
import {logger} from '@core/logger/logger';
import {useAppState} from '@shared/hooks/use-app-state';
import {sleep} from '@shared/lib/sleep';
import {paymentApi} from '../api/payment.api';
import {usePaymentStore} from '../store/payment.store';
import type {PaymentFlowStatus} from '../model/types';

const POLL_INTERVAL_MS = 1500;
const POLL_MAX_ATTEMPTS = 8;

/**
 * ⭐⭐⭐ THE MOST IMPORTANT HOOK IN THE PAYMENT FEATURE.
 *
 * It answers the question: "the user just came back from MoMo — have they paid?"
 *
 * The biggest trap for anyone new to mobile payments: assuming there is only ONE way
 * back (the deep link). There are actually THREE, and missing any of them leaves a
 * group of users stuck on the "processing" screen forever:
 *
 *   1. DEEP LINK — foodgo://payment/return.
 *      The happy path. Happens when the user taps "Quay lại ứng dụng" in MoMo.
 *
 *   2. THE APP RETURNS TO THE FOREGROUND — with no deep link at all.
 *      Happens when the user presses the device's Back button, or switches apps via
 *      the multitasker. Very common. The only signal is the AppState 'active' event.
 *
 *   3. COLD START — the OS KILLED the app while it was in the background.
 *      No deep link, no AppState change. The app starts from scratch and the only
 *      clue is the pendingIntentId persisted to disk.
 *
 * On all three routes, THE SERVER IS THE SOURCE OF TRUTH. We never trust the deep
 * link's parameters (anyone can type `foodgo://payment/return?status=success` into a
 * browser) — we only use it as a signal to go ASK the server.
 */
export function usePaymentReturn(options?: {
  onResolved?: (result: {success: boolean; orderId: string}) => void;
}) {
  const pendingIntentId = usePaymentStore(state => state.pendingIntentId);
  const pendingOrderId = usePaymentStore(state => state.pendingOrderId);
  const clearPending = usePaymentStore(state => state.clearPending);

  const [status, setStatus] = useState<PaymentFlowStatus>('idle');

  // Stops two verifications running on top of each other. Very easy to hit: the deep
  // link and the AppState 'active' event usually fire almost simultaneously.
  const isVerifying = useRef(false);
  const onResolvedRef = useRef(options?.onResolved);
  onResolvedRef.current = options?.onResolved;

  const verify = useCallback(async () => {
    const intentId = usePaymentStore.getState().pendingIntentId;
    const orderId = usePaymentStore.getState().pendingOrderId;

    if (!intentId || !orderId || isVerifying.current) {
      return;
    }

    isVerifying.current = true;
    setStatus('verifying');
    logger.info('Payment', `Đang xác minh giao dịch ${intentId}`);

    try {
      /**
       * Ask repeatedly: the gateway's webhook to the backend can arrive a few seconds
       * later than the user returns to the app. Asking once and concluding "failed"
       * is the classic mistake.
       */
      for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
        const intent = await paymentApi.getIntent(intentId);

        if (intent.status === 'PAID') {
          clearPending();
          setStatus('succeeded');
          appEventBus.emit('payment:succeeded', {
            orderId,
            paymentIntentId: intentId,
          });
          onResolvedRef.current?.({success: true, orderId});
          return;
        }

        if (intent.status === 'FAILED') {
          clearPending();
          setStatus('failed');
          appEventBus.emit('payment:failed', {
            orderId,
            reason: 'Giao dịch bị từ chối',
          });
          onResolvedRef.current?.({success: false, orderId});
          return;
        }

        await sleep(POLL_INTERVAL_MS);
      }

      /**
       * Out of attempts and still PENDING. Do NOT clear pendingIntentId here:
       * the transaction may still be processing. Keep it so the next app launch can
       * ask again. Better to ask redundantly than to lose track of someone's money.
       */
      setStatus('redirected');
      logger.warn('Payment', 'Hết thời gian chờ, giữ giao dịch để hỏi lại sau');
    } catch (error) {
      logger.error('Payment', 'Xác minh thất bại', error);
      setStatus('redirected'); // network error -> still pending
    } finally {
      isVerifying.current = false;
    }
  }, [clearPending]);

  /* --- Route 1: the deep link --- */
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({url}) => {
      if (url.includes('/payment/return')) {
        logger.info('Payment', `Nhận deep link: ${url}`);
        void verify();
      }
    });
    return () => subscription.remove();
  }, [verify]);

  /* --- Route 2: the app returns to the foreground --- */
  useAppState((next, previous) => {
    if (next === 'active' && previous !== 'active' && pendingIntentId) {
      void verify();
    }
  });

  /* --- Route 3: a cold start after the app was killed --- */
  useEffect(() => {
    if (pendingIntentId) {
      void verify();
    }
    // Deliberately runs only once on mount: this is the "relaunch" branch.
    // Routes 1 and 2 cover everything after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    pendingIntentId,
    pendingOrderId,
    /** Lets the screen re-check on demand (the "Tôi đã thanh toán" button). */
    verifyNow: verify,
    /** The user gave up — stop tracking this transaction. */
    abandon: () => {
      clearPending();
      setStatus('idle');
      if (pendingOrderId) {
        appEventBus.emit('payment:cancelled', {orderId: pendingOrderId});
      }
    },
  };
}
