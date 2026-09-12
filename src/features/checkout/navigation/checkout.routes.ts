export const CHECKOUT_ROUTES = {
  Checkout: 'Checkout',
  VoucherPicker: 'VoucherPicker',
} as const;

export type CheckoutStackParamList = {
  [CHECKOUT_ROUTES.Checkout]: undefined;
  [CHECKOUT_ROUTES.VoucherPicker]: undefined;
};
