import {logger} from '@core/logger/logger';
import {sleep} from '@shared/lib/sleep';
import type {PaymentProvider} from '../provider.types';

/**
 * THE CARD PROVIDER — the "finishes inside the app" flow.
 *
 * In a real app this is where Stripe's PaymentSheet would be called
 * (@stripe/stripe-react-native): the sheet appears INSIDE the app, the user goes
 * nowhere, and we know the outcome the moment the sheet closes.
 *
 * It sits next to MoMo in the same providers/ folder to make the point: however
 * different the mechanics, both satisfy the same interface. The rest of the app
 * does not have to care about the difference.
 */
export const cardProvider: PaymentProvider = {
  method: 'CARD',

  async isAvailable() {
    return true;
  },

  async pay(intent) {
    logger.info('Card', `Mở payment sheet cho ${intent.amount}đ`);
    // Replace with: await presentPaymentSheet()
    await sleep(400);
    // Returns 'redirected' so the demo shares the waiting screen with the other gateways.
    // With real Stripe this would be {status: 'completed'}.
    return {status: 'redirected'};
  },
};
