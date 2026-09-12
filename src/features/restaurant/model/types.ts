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

/** Order-taking status — derived from opening hours + the pause flag. */
export type RestaurantAvailability = 'open' | 'closed' | 'paused';
