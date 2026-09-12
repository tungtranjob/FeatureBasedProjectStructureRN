/**
 * THE APP-WIDE EVENT CATALOGUE — the "contract" between features.
 *
 * This is the list of things that can happen in the app that MORE THAN ONE feature
 * cares about. It is deliberately small: if only one feature cares, do not use an
 * event — call the function directly, it reads better.
 *
 * Naming convention: '<feature>:<what happened, in the past tense>'.
 * The past tense matters — an event describes A FACT THAT HAPPENED, not a
 * command. 'payment:succeeded' (right) vs 'clearCart' (wrong — that is a command,
 * and it forces payment to know that cart exists).
 */
export type AppEvents = {
  'auth:logged-in': {userId: string};
  'auth:logged-out': undefined;

  'cart:restaurant-switched': {fromRestaurantId: string; toRestaurantId: string};

  'order:placed': {orderId: string; orderCode: string; total: number};

  'payment:succeeded': {orderId: string; paymentIntentId: string};
  'payment:failed': {orderId: string; reason: string};
  'payment:cancelled': {orderId: string};
};

export type AppEventName = keyof AppEvents;
