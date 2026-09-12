import {http, withQuery} from '@core/api/http-client';
import type {RestaurantDto} from '@core/api/contracts';
import type {Paginated} from '@shared/types/api';
import {asId} from '@shared/types/id';
import type {RestaurantId} from '@shared/types/id';
import {money} from '@shared/types/money';
import type {Restaurant} from '../model/types';

/**
 * MAPPER DTO -> DOMAIN MODEL.
 *
 * Only a small function, but it is the feature's "customs desk": all server data has
 * to be declared here before it is allowed into the app. When the backend renames
 * `coverImageUrl` to `thumbnail`, you edit exactly 1 line here.
 */
const toRestaurant = (dto: RestaurantDto): Restaurant => ({
  id: asId<RestaurantId>(dto.id),
  name: dto.name,
  coverImageUrl: dto.coverImageUrl,
  cuisines: dto.cuisines,
  rating: dto.rating,
  ratingCount: dto.ratingCount,
  distanceKm: dto.distanceKm,
  // bare number -> the branded Money type.
  deliveryFee: money(dto.deliveryFee),
  minOrderAmount: money(dto.minOrderAmount),
  etaMinutes: dto.etaMinutes,
  openHour: dto.openHour,
  closeHour: dto.closeHour,
  isPaused: dto.isPaused,
  promoLabel: dto.promoLabel,
});

export const restaurantApi = {
  async list(params: {search?: string; cuisine?: string}): Promise<Restaurant[]> {
    const response = await http.get<Paginated<RestaurantDto>>(
      withQuery('/restaurants', {
        search: params.search,
        cuisine: params.cuisine,
        pageSize: 20,
      }),
    );
    return response.items.map(toRestaurant);
  },

  async detail(id: string): Promise<Restaurant> {
    const dto = await http.get<RestaurantDto>(`/restaurants/${id}`);
    return toRestaurant(dto);
  },
};
