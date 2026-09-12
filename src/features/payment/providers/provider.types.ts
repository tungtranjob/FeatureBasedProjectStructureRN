import type {PaymentIntent, PaymentLaunchResult, PaymentMethod} from '../model/types';

/**
 * ⭐ THE SHARED PORT FOR EVERY PAYMENT PROVIDER.
 *
 * Every gateway (MoMo, VNPay, Stripe, ...) has a completely different SDK and a
 * completely different flow. This interface is the only thing the rest of the app
 * ever sees — it turns those differences into a private matter of the
 * providers/ folder.
 *
 * The payoff: adding ZaloPay = adding one folder. No screen, no hook and no store
 * has to change.
 */
export interface PaymentProvider {
  readonly method: PaymentMethod;

  /**
   * Can this method be used on the current device?
   * E.g. without the MoMo app installed, a momo:// deeplink cannot be opened.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Starts the payment.
   *
   * ⚠️ This function does NOT return "whether the payment succeeded".
   * For a redirecting gateway it only returns 'redirected' — meaning the app has been
   * pushed to the background. The real result must be asked of the server (see use-payment-return.ts).
   * The client must never decide by itself that money has been paid.
   */
  pay(intent: PaymentIntent): Promise<PaymentLaunchResult>;
}
