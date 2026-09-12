import {useQuery} from '@tanstack/react-query';
import {menuApi} from './menu.api';
import {menuKeys} from './menu.keys';

export function useMenu(restaurantId: string | undefined) {
  return useQuery({
    queryKey: menuKeys.byRestaurant(restaurantId ?? ''),
    queryFn: () => menuApi.getMenu(restaurantId as string),
    enabled: Boolean(restaurantId),
  });
}

export function useMenuItem(itemId: string | undefined) {
  return useQuery({
    queryKey: menuKeys.item(itemId ?? ''),
    queryFn: () => menuApi.getItem(itemId as string),
    enabled: Boolean(itemId),
    /**
     * A menu rarely changes during one shopping session -> keep it longer than the default.
     * staleTime is the main lever for balancing "fresh data" against "number of requests".
     */
    staleTime: 5 * 60_000,
  });
}
