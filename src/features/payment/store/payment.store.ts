import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {mmkvStorage} from '@core/storage/zustand-persist';

/**
 * ⭐⭐ THE MOST RELIABILITY-CRITICAL STORE IN THE APP.
 *
 * It holds "is there a transaction in flight" and MUST be persisted.
 *
 * Why it must: when the user taps pay with MoMo, our app is pushed to the background.
 * Android on a low-RAM device KILLS our app while they are away fairly often. When
 * they return, the app starts FROM SCRATCH — all in-memory state is gone.
 *
 * Without persistence: the app opens blank, unaware that a transaction is pending.
 * The user has been charged but the app shows the cart as if nothing happened.
 * This is the worst class of bug in a payment app.
 *
 * With persistence, a cold start finds pendingIntentId, asks the server again, and
 * handles it correctly.
 */
interface PaymentState {
  pendingIntentId: string | null;
  pendingOrderId: string | null;
  /** A timestamp for detecting a transaction that has hung for too long. */
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
