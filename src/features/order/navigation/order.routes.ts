export const ORDER_ROUTES = {
  OrderList: 'OrderList',
  OrderDetail: 'OrderDetail',
} as const;

export type OrderStackParamList = {
  [ORDER_ROUTES.OrderList]: undefined;
  [ORDER_ROUTES.OrderDetail]: {orderId: string; highlightPayment?: boolean};
};

/** Deep link: foodgo://order/<id> — dùng trong push notification. */
export const orderLinking = {
  [ORDER_ROUTES.OrderDetail]: 'order/:orderId',
};
