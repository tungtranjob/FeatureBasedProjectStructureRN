import {useQuery} from '@tanstack/react-query';
import {restaurantApi} from './restaurant.api';
import {restaurantKeys} from './restaurant.keys';

/**
 * SERVER STATE — dùng TanStack Query, KHÔNG dùng Zustand.
 *
 * Chỉ vài dòng nhưng bạn được miễn phí: cache, dedupe (2 component cùng gọi
 * -> 1 request), loading/error state, retry, refetch, background update,
 * và dọn rác khi không ai dùng nữa.
 *
 * Tự viết lại ngần ấy thứ trong một Zustand store là công việc vài tuần và
 * sẽ đầy bug tinh vi.
 */
export function useRestaurants(filters: {search?: string; cuisine?: string} = {}) {
  return useQuery({
    queryKey: restaurantKeys.list(filters),
    queryFn: () => restaurantApi.list(filters),
  });
}

export function useRestaurant(id: string | undefined) {
  return useQuery({
    queryKey: restaurantKeys.detail(id ?? ''),
    queryFn: () => restaurantApi.detail(id as string),
    // Chưa có id thì đừng gọi mạng. Quan trọng khi id đến từ param điều hướng.
    enabled: Boolean(id),
  });
}
