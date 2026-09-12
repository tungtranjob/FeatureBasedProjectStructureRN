import type {PaymentProvider} from '../provider.types';

/**
 * THE COD PROVIDER — an "empty provider".
 *
 * Cash has no payment gateway at all. We still give it a provider rather than writing
 * `if (method === 'COD') { ... }` in the checkout screen.
 *
 * Why: every method goes down the SAME code path. There is no special branch left
 * unhandled, and no screen has to know that COD is an exception.
 * This is the Null Object pattern.
 */
export const codProvider: PaymentProvider = {
  method: 'COD',

  async isAvailable() {
    return true;
  },

  async pay() {
    // Nothing to open. The order is already CONFIRMED by the server.
    return {status: 'completed'};
  },
};
