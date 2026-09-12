import {money} from '@shared/types/money';
import {asId} from '@shared/types/id';
import type {AddressId, OrderId} from '@shared/types/id';
import {
  canCancelOrder,
  getEstimatedArrival,
  getProgressIndex,
  isActiveOrder,
} from '../order-rules';
import type {Order, OrderStatus} from '../types';

const order = (status: OrderStatus): Order => ({
  id: asId<OrderId>('ord_1'),
  code: 'FG-0001',
  restaurant: {id: 'res_1', name: 'Phở Thìn', imageUrl: ''},
  items: [],
  fees: {
    subtotal: money(100000),
    deliveryFee: money(15000),
    serviceFee: money(3000),
    discount: money(0),
    total: money(118000),
  },
  status,
  paymentMethod: 'COD',
  paymentStatus: 'PENDING',
  address: {
    id: asId<AddressId>('addr_1'),
    label: 'Nhà',
    recipientName: 'Tùng',
    phone: '0900000000',
    line: '25 Nguyễn Huệ',
    ward: 'Bến Nghé',
    district: 'Quận 1',
    city: 'TP.HCM',
    isDefault: true,
  },
  placedAt: '2026-09-12T10:00:00.000Z',
  etaMinutes: 30,
  statusHistory: [],
});

describe('canCancelOrder', () => {
  it('cho huỷ khi chờ thanh toán hoặc vừa được xác nhận', () => {
    expect(canCancelOrder(order('PENDING_PAYMENT'))).toBe(true);
    expect(canCancelOrder(order('CONFIRMED'))).toBe(true);
  });

  it('không cho huỷ khi bếp đã bắt đầu nấu', () => {
    expect(canCancelOrder(order('PREPARING'))).toBe(false);
    expect(canCancelOrder(order('DELIVERING'))).toBe(false);
  });

  it('không cho huỷ đơn đã kết thúc', () => {
    expect(canCancelOrder(order('COMPLETED'))).toBe(false);
    expect(canCancelOrder(order('CANCELLED'))).toBe(false);
  });
});

describe('isActiveOrder', () => {
  it('phân loại đúng đơn đang chạy và đơn đã xong', () => {
    expect(isActiveOrder(order('DELIVERING'))).toBe(true);
    expect(isActiveOrder(order('COMPLETED'))).toBe(false);
    expect(isActiveOrder(order('CANCELLED'))).toBe(false);
  });
});

describe('getProgressIndex', () => {
  it('trả về đúng vị trí trên thanh tiến trình', () => {
    expect(getProgressIndex('CONFIRMED')).toBe(0);
    expect(getProgressIndex('DELIVERING')).toBe(2);
  });

  it('trả về -1 cho trạng thái không nằm trên thanh tiến trình', () => {
    expect(getProgressIndex('CANCELLED')).toBe(-1);
    expect(getProgressIndex('PENDING_PAYMENT')).toBe(-1);
  });
});

describe('getEstimatedArrival', () => {
  it('cộng ETA vào thời điểm đặt', () => {
    const arrival = getEstimatedArrival(order('CONFIRMED'));
    expect(arrival.toISOString()).toBe('2026-09-12T10:30:00.000Z');
  });
});
