import {useQuery} from '@tanstack/react-query';
import {restaurantApi} from './restaurant.api';
import {restaurantKeys} from './restaurant.keys';

/**
 * SERVER STATE — use TanStack Query, NOT Zustand.
 *
 * A handful of lines, and you get for free: caching, dedupe (2 components calling
 * -> 1 request), loading/error state, retry, refetch, background update,
 * and garbage collection when nobody uses it any more.
 *
 * Rebuilding all of that inside a Zustand store is weeks of work and would be full
 * of subtle bugs.
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
    // No id yet means no network call. Important when the id comes from a navigation param.
    enabled: Boolean(id),
  });
}
