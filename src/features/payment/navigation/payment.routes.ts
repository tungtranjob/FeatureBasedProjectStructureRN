export const PAYMENT_ROUTES = {
  PaymentProcessing: 'PaymentProcessing',
} as const;

export type PaymentStackParamList = {
  [PAYMENT_ROUTES.PaymentProcessing]: {
    intentId: string;
    orderId: string;
    orderCode: string;
  };
};

/**
 * THE PAYMENT FEATURE'S OWN DEEP LINK CONFIG.
 *
 * app/navigation/linking.config.ts gathers this fragment together with the other
 * features'. That keeps the deep link declaration next to the screen that handles it,
 * instead of in one giant config file somewhere far away.
 *
 * Extra native declarations required:
 *   iOS     — Info.plist > CFBundleURLTypes (scheme "foodgo")
 *   Android — AndroidManifest.xml > intent-filter
 */
export const paymentLinking = {
  [PAYMENT_ROUTES.PaymentProcessing]: 'payment/return',
};
