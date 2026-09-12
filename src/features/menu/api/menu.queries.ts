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
     * Menu ít đổi trong một phiên mua sắm -> để lâu hơn mặc định.
     * staleTime là công cụ chính để cân bằng "dữ liệu mới" và "số request".
     */
    staleTime: 5 * 60_000,
  });
}
