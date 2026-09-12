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
 * The fee breakdown.
 *
 * Defined in the order feature (not in shared/) because it is a DOMAIN concept and
 * order is the feature that owns it. The checkout feature imports this type from
 * '@features/order' — a one-way dependency, which is fine.
 *
 * Putting it in shared/ would be slightly more convenient, but that is the first step
 * down the road where shared/ becomes a dumping ground for half the app's business rules.
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
  /** The price LOCKED at order time — unchanged even if the restaurant raises it later. */
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
