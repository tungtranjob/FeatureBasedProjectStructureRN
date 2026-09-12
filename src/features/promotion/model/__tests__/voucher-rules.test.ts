import {money} from '@shared/types/money';
import {asId} from '@shared/types/id';
import type {VoucherId} from '@shared/types/id';
import {calcDiscount, checkEligibility, sortVouchersForDisplay} from '../voucher-rules';
import type {Voucher} from '../types';

const NOW = new Date('2026-09-12T10:00:00Z');

const voucher = (overrides: Partial<Voucher> = {}): Voucher => ({
  id: asId<VoucherId>('vch_1'),
  code: 'TEST',
  title: 'Test',
  description: '',
  discountType: 'PERCENT',
  value: 20,
  maxDiscount: money(30000),
  minOrderAmount: money(100000),
  restaurantId: null,
  expiresAt: '2026-12-31T00:00:00Z',
  ...overrides,
});

const params = (subtotal: number, restaurantId: string | null = 'res_1') => ({
  subtotal: money(subtotal),
  deliveryFee: money(15000),
  restaurantId,
});

describe('checkEligibility', () => {
  it('hợp lệ khi đủ điều kiện', () => {
    expect(checkEligibility(voucher(), params(200000), NOW).eligible).toBe(true);
  });

  it('từ chối voucher hết hạn', () => {
    const result = checkEligibility(
      voucher({expiresAt: '2026-01-01T00:00:00Z'}),
      params(200000),
      NOW,
    );
    expect(result).toMatchObject({eligible: false, reason: 'expired'});
  });

  it('từ chối khi chưa đạt đơn tối thiểu, và nói rõ còn thiếu bao nhiêu', () => {
    const result = checkEligibility(voucher(), params(70000), NOW);
    expect(result).toMatchObject({eligible: false, reason: 'below-min-order'});
    if (!result.eligible) {
      expect(result.message).toContain('30.000đ');
    }
  });

  it('từ chối voucher của nhà hàng khác', () => {
    const result = checkEligibility(
      voucher({restaurantId: 'res_999'}),
      params(200000, 'res_1'),
      NOW,
    );
    expect(result).toMatchObject({eligible: false, reason: 'wrong-restaurant'});
  });
});

describe('calcDiscount', () => {
  it('không có voucher thì giảm 0', () => {
    expect(calcDiscount(null, params(200000), NOW)).toBe(0);
  });

  it('PERCENT: tính theo phần trăm', () => {
    const v = voucher({value: 10, maxDiscount: null});
    expect(calcDiscount(v, params(200000), NOW)).toBe(20000);
  });

  it('PERCENT: bị chặn bởi trần giảm giá', () => {
    // 20% của 500.000 = 100.000, nhưng trần là 30.000.
    expect(calcDiscount(voucher(), params(500000), NOW)).toBe(30000);
  });

  it('FIXED: không giảm quá tiền hàng', () => {
    const v = voucher({
      discountType: 'FIXED',
      value: 100000,
      minOrderAmount: money(0),
    });
    expect(calcDiscount(v, params(60000), NOW)).toBe(60000);
  });

  it('FREESHIP: giảm đúng bằng phí giao hàng', () => {
    const v = voucher({discountType: 'FREESHIP', minOrderAmount: money(0)});
    expect(calcDiscount(v, params(200000), NOW)).toBe(15000);
  });

  it('voucher không hợp lệ thì giảm 0 thay vì ném lỗi', () => {
    // Quan trọng: hàm này chạy trong lúc render, ném lỗi là màn hình trắng.
    expect(calcDiscount(voucher(), params(10000), NOW)).toBe(0);
  });
});

describe('sortVouchersForDisplay', () => {
  it('đưa voucher dùng được lên đầu, giảm nhiều hơn lên trước', () => {
    const usableSmall = voucher({
      id: asId<VoucherId>('small'),
      discountType: 'FIXED',
      value: 10000,
      minOrderAmount: money(0),
    });
    const usableBig = voucher({
      id: asId<VoucherId>('big'),
      discountType: 'FIXED',
      value: 50000,
      minOrderAmount: money(0),
    });
    const unusable = voucher({
      id: asId<VoucherId>('expired'),
      expiresAt: '2020-01-01T00:00:00Z',
    });

    const sorted = sortVouchersForDisplay(
      [unusable, usableSmall, usableBig],
      params(200000),
      NOW,
    );
    expect(sorted.map(v => v.id)).toEqual(['big', 'small', 'expired']);
  });
});
