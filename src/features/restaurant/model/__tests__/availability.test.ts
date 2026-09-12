import {canOrderFrom, getAvailability} from '../availability';

/**
 * Vì `availability.ts` là TypeScript thuần (không React, không RN), test
 * của nó chạy trong vài mili-giây và không cần render gì cả.
 *
 * Đây là lý do thực dụng nhất để tách model/ ra khỏi component: nếu logic
 * này nằm trong RestaurantCard.tsx, muốn test ca "quán mở qua đêm" bạn
 * phải render cả một cái thẻ và mock đồng hồ hệ thống.
 */
const at = (hour: number) => new Date(2026, 0, 15, hour, 0, 0);

describe('getAvailability', () => {
  const normalShop = {openHour: 8, closeHour: 22, isPaused: false};

  it('mở cửa trong khung giờ hoạt động', () => {
    expect(getAvailability(normalShop, at(12))).toBe('open');
  });

  it('đóng cửa trước giờ mở', () => {
    expect(getAvailability(normalShop, at(6))).toBe('closed');
  });

  it('đóng cửa đúng thời điểm đóng (biên không bao gồm)', () => {
    expect(getAvailability(normalShop, at(22))).toBe('closed');
  });

  it('mở cửa đúng thời điểm mở (biên bao gồm)', () => {
    expect(getAvailability(normalShop, at(8))).toBe('open');
  });

  it('tạm ngưng thắng cả khi đang trong giờ mở cửa', () => {
    expect(getAvailability({...normalShop, isPaused: true}, at(12))).toBe('paused');
  });

  describe('quán bán xuyên đêm (18h - 2h)', () => {
    const nightShop = {openHour: 18, closeHour: 2, isPaused: false};

    it('mở lúc 20h', () => {
      expect(getAvailability(nightShop, at(20))).toBe('open');
    });

    it('vẫn mở lúc 1h sáng', () => {
      expect(getAvailability(nightShop, at(1))).toBe('open');
    });

    it('đóng lúc 10h sáng', () => {
      expect(getAvailability(nightShop, at(10))).toBe('closed');
    });
  });
});

describe('canOrderFrom', () => {
  it('chỉ cho đặt khi đang mở cửa', () => {
    const shop = {openHour: 8, closeHour: 22, isPaused: false};
    expect(canOrderFrom(shop, at(12))).toBe(true);
    expect(canOrderFrom(shop, at(23))).toBe(false);
    expect(canOrderFrom({...shop, isPaused: true}, at(12))).toBe(false);
  });
});
