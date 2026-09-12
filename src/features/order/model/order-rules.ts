import type {Order, OrderStatus} from './types';

/**
 * Các bước hiển thị trên thanh tiến trình đơn hàng.
 * CANCELLED không nằm trong đây vì nó không phải một bước tiến — nó là
 * nhánh rẽ ra ngoài, và UI hiển thị khác hẳn.
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
 * QUY TẮC NGHIỆP VỤ: chỉ huỷ được trước khi bếp bắt đầu nấu.
 *
 * Hàm này nằm ở model/ chứ không nằm trong OrderDetailScreen, vì cùng một
 * quy tắc được dùng ở ít nhất ba nơi: ẩn/hiện nút Huỷ trong danh sách, trong
 * màn chi tiết, và trong hộp thoại xác nhận. Ba bản sao của một điều kiện
 * `if` là ba cơ hội để chúng lệch nhau.
 *
 * (Server vẫn kiểm tra lại — client chỉ quyết định hiển thị.)
 */
export const canCancelOrder = (order: Order): boolean =>
  order.status === 'PENDING_PAYMENT' || order.status === 'CONFIRMED';

/** Đơn còn "đang chạy" (hiện ở tab Đang đến) hay đã kết thúc. */
export const isActiveOrder = (order: Order): boolean =>
  order.status !== 'COMPLETED' && order.status !== 'CANCELLED';

/** Vị trí hiện tại trên thanh tiến trình; -1 nghĩa là không áp dụng. */
export const getProgressIndex = (status: OrderStatus): number =>
  ORDER_PROGRESS_STEPS.indexOf(status);

/**
 * Giờ giao dự kiến = lúc đặt + ETA.
 * Nhận `placedAt` dạng ISO string, trả về Date để UI tự định dạng.
 */
export const getEstimatedArrival = (order: Order): Date =>
  new Date(new Date(order.placedAt).getTime() + order.etaMinutes * 60_000);
