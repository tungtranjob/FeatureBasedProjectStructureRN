import type {Order, OrderStatus} from './types';

/**
 * The steps shown on the order progress bar.
 * CANCELLED is not among them because it is not a step forward — it is a branch off
 * to the side, and the UI renders it completely differently.
 */
export const ORDER_PROGRESS_STEPS: OrderStatus[] = [
  'CONFIRMED',
  'PREPARING',
  'DELIVERING',
  'COMPLETED',
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: 'Chờ thanh toán',
  CONFIRMED: 'Đã xác nhận',
  PREPARING: 'Đang chuẩn bị',
  DELIVERING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã huỷ',
};

export const ORDER_STATUS_EMOJI: Record<OrderStatus, string> = {
  PENDING_PAYMENT: '⏳',
  CONFIRMED: '✅',
  PREPARING: '👨‍🍳',
  DELIVERING: '🛵',
  COMPLETED: '🎉',
  CANCELLED: '❌',
};

/**
 * BUSINESS RULE: cancelling is only possible before the kitchen starts cooking.
 *
 * This function lives in model/ rather than in OrderDetailScreen, because the same
 * rule is used in at least three places: showing/hiding the Cancel button in the list,
 * in the detail screen, and in the confirmation dialog. Three copies of one `if`
 * condition are three chances for them to drift apart.
 *
 * (The server checks again — the client only decides what to display.)
 */
export const canCancelOrder = (order: Order): boolean =>
  order.status === 'PENDING_PAYMENT' || order.status === 'CONFIRMED';

/** Whether the order is still "active" (shown in the Đang đến tab) or finished. */
export const isActiveOrder = (order: Order): boolean =>
  order.status !== 'COMPLETED' && order.status !== 'CANCELLED';

/** The current position on the progress bar; -1 means not applicable. */
export const getProgressIndex = (status: OrderStatus): number =>
  ORDER_PROGRESS_STEPS.indexOf(status);

/**
 * Estimated delivery time = time placed + ETA.
 * Takes `placedAt` as an ISO string and returns a Date for the UI to format.
 */
export const getEstimatedArrival = (order: Order): Date =>
  new Date(new Date(order.placedAt).getTime() + order.etaMinutes * 60_000);
