/** PUBLIC API của feature order. */
export {OrderListScreen} from './screens/OrderListScreen';
export {OrderDetailScreen} from './screens/OrderDetailScreen';
export {ORDER_ROUTES, orderLinking} from './navigation/order.routes';
export type {OrderStackParamList} from './navigation/order.routes';

// checkout dùng usePlaceOrder + kiểu FeeBreakdown.
export {usePlaceOrder, useOrder, useOrders, useCancelOrder} from './api/order.queries';
export {orderKeys} from './api/order.keys';
export {orderApi} from './api/order.api';
export {canCancelOrder, isActiveOrder} from './model/order-rules';
export type {Order, OrderItem, OrderStatus, FeeBreakdown} from './model/types';
