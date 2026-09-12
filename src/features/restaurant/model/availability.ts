import type {Restaurant, RestaurantAvailability} from './types';

/**
 * Nhà hàng có đang nhận đơn không?
 *
 * Hàm thuần, nhận `now` làm THAM SỐ chứ không gọi Date.now() bên trong.
 * Đó là mẹo nhỏ nhưng quan trọng: nhờ vậy test kiểm được cả lúc 3 giờ sáng
 * mà không cần mock đồng hồ hệ thống.
 */
export const getAvailability = (
  restaurant: Pick<Restaurant, 'openHour' | 'closeHour' | 'isPaused'>,
  now: Date = new Date(),
): RestaurantAvailability => {
  // Tạm ngưng thủ công thắng mọi thứ khác — kể cả đang trong giờ mở cửa.
  if (restaurant.isPaused) {
    return 'paused';
  }

  const hour = now.getHours();
  const {openHour, closeHour} = restaurant;

  // Ca qua đêm, VD mở 18h đóng 2h sáng hôm sau.
  const isOvernight = closeHour <= openHour;
  const isOpen = isOvernight
    ? hour >= openHour || hour < closeHour
    : hour >= openHour && hour < closeHour;

  return isOpen ? 'open' : 'closed';
};

export const canOrderFrom = (
  restaurant: Pick<Restaurant, 'openHour' | 'closeHour' | 'isPaused'>,
  now: Date = new Date(),
): boolean => getAvailability(restaurant, now) === 'open';

export const AVAILABILITY_LABEL: Record<RestaurantAvailability, string> = {
  open: 'Đang mở cửa',
  closed: 'Đã đóng cửa',
  paused: 'Tạm ngưng nhận đơn',
};
