import {canOrderFrom, getAvailability} from '../availability';

/**
 * Because `availability.ts` is plain TypeScript (no React, no RN), its tests run in
 * a few milliseconds and render nothing at all.
 *
 * That is the most practical reason to keep model/ out of components: if this logic
 * lived inside RestaurantCard.tsx, testing the "open overnight" case would mean
 * rendering a whole card and mocking the system clock.
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
