import {useQuery} from '@tanstack/react-query';
import {promotionApi} from './promotion.api';
import {promotionKeys} from './promotion.keys';

export function useVouchers(restaurantId: string | null) {
  return useQuery({
    queryKey: promotionKeys.vouchers(restaurantId),
    queryFn: () => promotionApi.listVouchers(restaurantId),
    /**
     * Voucher gần như không đổi trong một phiên -> cache 5 phút.
     * Quan trọng vì màn chọn voucher có thể mở/đóng nhiều lần liên tiếp.
     */
    staleTime: 5 * 60_000,
  });
}
