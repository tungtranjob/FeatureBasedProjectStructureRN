import {money} from '@shared/types/money';
import {getAvailableMethods, resolveValidMethod} from '../payment-method.registry';

describe('getAvailableMethods', () => {
  it('cho phép COD với đơn nhỏ', () => {
    const methods = getAvailableMethods(money(300_000), 'ios');
    expect(methods.map(m => m.method)).toContain('COD');
  });

  it('loại COD khi đơn vượt hạn mức', () => {
    const methods = getAvailableMethods(money(1_500_000), 'ios');
    expect(methods.map(m => m.method)).not.toContain('COD');
  });

  it('luôn còn ít nhất một phương thức online', () => {
    expect(getAvailableMethods(money(50_000_000), 'android').length).toBeGreaterThan(0);
  });
});

describe('resolveValidMethod', () => {
  it('giữ nguyên phương thức nếu vẫn hợp lệ', () => {
    expect(resolveValidMethod('MOMO', money(200_000), 'ios')).toBe('MOMO');
  });

  it('tự chuyển khi phương thức hiện tại không còn hợp lệ', () => {
    // Kịch bản: chọn COD rồi thêm món khiến đơn vượt 1 triệu.
    const next = resolveValidMethod('COD', money(1_500_000), 'ios');
    expect(next).not.toBe('COD');
  });
});
