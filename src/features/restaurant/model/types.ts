import type {Money} from '@shared/types/money';
import type {RestaurantId} from '@shared/types/id';

export interface Restaurant {
  id: RestaurantId;
  name: string;
  coverImageUrl: string;
  cuisines: string[];
  rating: number;
  ratingCount: number;
  distanceKm: number;
  deliveryFee: Money;
  minOrderAmount: Money;
  etaMinutes: number;
  openHour: number;
  closeHour: number;
  isPaused: boolean;
  promoLabel: string | null;
}

/** Trạng thái nhận đơn — tính ra từ giờ mở cửa + cờ tạm ngưng. */
export type RestaurantAvailability = 'open' | 'closed' | 'paused';
