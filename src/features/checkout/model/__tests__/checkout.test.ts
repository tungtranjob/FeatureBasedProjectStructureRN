import {money} from '@shared/types/money';
import {calcOrderTotal, calcServiceFee} from '../calc-order-total';
import {canPlaceOrder, validateCheckout} from '../validate-checkout';

describe('calcServiceFee', () => {
  it('tính 3% của tạm tính', () => {
    expect(calcServiceFee(money(100000))).toBe(3000);
  });

  it('bị chặn bởi trần 10.000đ', () => {
    expect(calcServiceFee(money(5_000_000))).toBe(10000);
  });
});

describe('calcOrderTotal', () => {
  it('cộng đủ các khoản', () => {
    const fees = calcOrderTotal({
      subtotal: money(200000),
      deliveryFee: money(15000),
      discount: money(0),
    });
    expect(fees.serviceFee).toBe(6000);
    expect(fees.total).toBe(200000 + 15000 + 6000);
  });

  it('trừ giảm giá', () => {
    const fees = calcOrderTotal({
      subtotal: money(200000),
      deliveryFee: money(15000),
      discount: money(30000),
    });
    expect(fees.total).toBe(200000 + 15000 + 6000 - 30000);
  });

  it('không bao giờ trả về tổng âm', () => {
    // Voucher giảm nhiều hơn cả đơn — không được ra số âm.
    const fees = calcOrderTotal({
      subtotal: money(50000),
      deliveryFee: money(15000),
      discount: money(999999),
    });
    expect(fees.total).toBe(0);
  });
});

describe('validateCheckout', () => {
  const valid = {
    itemCount: 2,
    hasAddress: true,
    isRestaurantOpen: true,
    subtotal: money(200000),
    minOrderAmount: money(50000),
  };

  it('không có vấn đề gì khi mọi thứ hợp lệ', () => {
    expect(validateCheckout(valid)).toEqual([]);
    expect(canPlaceOrder(valid)).toBe(true);
  });

  it('giỏ rỗng thì dừng lại luôn, không báo thêm lỗi khác', () => {
    const blockers = validateCheckout({
      ...valid,
      itemCount: 0,
      hasAddress: false,
      isRestaurantOpen: false,
    });
    expect(blockers).toHaveLength(1);
    expect(blockers[0]?.kind).toBe('empty-cart');
  });

  it('phát hiện thiếu địa chỉ', () => {
    const blockers = validateCheckout({...valid, hasAddress: false});
    expect(blockers[0]?.kind).toBe('no-address');
  });

  it('phát hiện nhà hàng đóng cửa', () => {
    const blockers = validateCheckout({...valid, isRestaurantOpen: false});
    expect(blockers.some(b => b.kind === 'restaurant-closed')).toBe(true);
  });

  it('tính đúng số tiền còn thiếu để đạt đơn tối thiểu', () => {
    const blockers = validateCheckout({
      ...valid,
      subtotal: money(30000),
      minOrderAmount: money(50000),
    });
    const blocker = blockers.find(b => b.kind === 'below-min-order');
    expect(blocker).toBeDefined();
    if (blocker?.kind === 'below-min-order') {
      expect(blocker.missing).toBe(20000);
    }
  });
});
