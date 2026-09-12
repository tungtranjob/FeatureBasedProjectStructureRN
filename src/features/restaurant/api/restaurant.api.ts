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
 * Chỉ một hàm nhỏ, nhưng nó là "hải quan" của feature: mọi dữ liệu từ server
 * phải khai báo ở đây trước khi được vào trong app. Khi backend đổi
 * `coverImageUrl` thành `thumbnail`, bạn sửa đúng 1 dòng tại đây.
 */
const toRestaurant = (dto: RestaurantDto): Restaurant => ({
  id: asId<RestaurantId>(dto.id),
  name: dto.name,
  coverImageUrl: dto.coverImageUrl,
  cuisines: dto.cuisines,
  rating: dto.rating,
  ratingCount: dto.ratingCount,
  distanceKm: dto.distanceKm,
  // number trần -> Money có branded type.
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
