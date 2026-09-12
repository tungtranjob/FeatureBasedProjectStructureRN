export const CART_ROUTES = {
  Cart: 'Cart',
} as const;

export type CartStackParamList = {
  [CART_ROUTES.Cart]: undefined;
};
