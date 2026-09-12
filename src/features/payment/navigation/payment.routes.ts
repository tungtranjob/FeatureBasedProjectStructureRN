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
 * CẤU HÌNH DEEP LINK CỦA RIÊNG FEATURE PAYMENT.
 *
 * app/navigation/linking.config.ts sẽ gom mảnh này cùng mảnh của các feature
 * khác. Nhờ vậy khai báo deep link nằm cạnh màn hình xử lý nó, thay vì nằm
 * trong một file cấu hình khổng lồ ở tận đâu.
 *
 * Cần khai báo thêm ở native:
 *   iOS     — Info.plist > CFBundleURLTypes (scheme "foodgo")
 *   Android — AndroidManifest.xml > intent-filter
 */
export const paymentLinking = {
  [PAYMENT_ROUTES.PaymentProcessing]: 'payment/return',
};
