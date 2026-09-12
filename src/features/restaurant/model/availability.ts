import type {Restaurant, RestaurantAvailability} from './types';

/**
 * Is the restaurant currently accepting orders?
 *
 * A pure function that takes `now` as a PARAMETER rather than calling Date.now() inside.
 * Small but important trick: it lets tests cover 3am without mocking the system
 * clock.
 */
export const getAvailability = (
  restaurant: Pick<Restaurant, 'openHour' | 'closeHour' | 'isPaused'>,
  now: Date = new Date(),
): RestaurantAvailability => {
  // A manual pause beats everything else — even during opening hours.
  if (restaurant.isPaused) {
    return 'paused';
  }

  const hour = now.getHours();
  const {openHour, closeHour} = restaurant;

  // An overnight shift, e.g. open at 18:00 and close at 02:00 the next day.
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
