import type {Money} from '@shared/types/money';
import type {OrderId, PaymentIntentId} from '@shared/types/id';

export type PaymentMethod = 'COD' | 'MOMO' | 'VNPAY' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface PaymentIntent {
  id: PaymentIntentId;
  orderId: OrderId;
  method: PaymentMethod;
  amount: Money;
  status: PaymentStatus;
  /** URL/deeplink that opens the gateway app. null for COD. */
  redirectUrl: string | null;
  expiresAt: string;
}

/**
 * The result of "starting" a payment.
 *
 * ⭐ Telling `completed` and `redirected` apart is the crux of mobile
 * payments:
 *
 *   completed  -> finished inside the app (COD, or an Apple Pay/Google Pay sheet).
 *   redirected -> THE APP HAS BEEN BACKGROUNDED. The user is inside the MoMo app.
 *                 We do not know when they will come back, or whether they will.
 *                 The OS may well kill the app in the meantime.
 *   aborted    -> could not start (the gateway app is not installed).
 */
export type PaymentLaunchResult =
  | {status: 'completed'}
  | {status: 'redirected'}
  | {status: 'aborted'; reason: string};

/** The payment flow's status as the UI sees it. */
export type PaymentFlowStatus =
  | 'idle'
  | 'initiating' // asking the server to create the transaction
  | 'redirected' // left the app, waiting for the return
  | 'verifying' // back in the app, asking the server for the result
  | 'succeeded'
  | 'failed';
