import type {Money} from '@shared/types/money';
import type {OrderId} from '@shared/types/id';
import type {DeliveryAddress} from '@features/address';
import type {PaymentMethod, PaymentStatus} from '@features/payment';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

/**
 * Bảng kê phí.
 *
 * Được định nghĩa ở feature order (chứ không phải shared/) vì nó là khái
 * niệm NGHIỆP VỤ, và order là feature sở hữu nó. Feature checkout import
 * kiểu này từ '@features/order' — phụ thuộc một chiều, hợp lệ.
 *
 * Để nó ở shared/ sẽ tiện hơn một chút, nhưng đó là bước đầu tiên trên con
 * đường biến shared/ thành bãi rác chứa nửa số quy tắc nghiệp vụ của app.
 */
export interface FeeBreakdown {
  subtotal: Money;
  deliveryFee: Money;
  serviceFee: Money;
  discount: Money;
  total: Money;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  /** Giá đã CHỐT lúc đặt — không đổi kể cả khi quán tăng giá sau đó. */
  unitPrice: Money;
  optionNames: string[];
  note: string;
  lineTotal: Money;
}

export interface OrderStatusEvent {
  status: OrderStatus;
  at: string;
  note: string;
}

export interface Order {
  id: OrderId;
  code: string;
  restaurant: {id: string; name: string; imageUrl: string};
  items: OrderItem[];
  fees: FeeBreakdown;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  address: DeliveryAddress;
  placedAt: string;
  etaMinutes: number;
  statusHistory: OrderStatusEvent[];
}
