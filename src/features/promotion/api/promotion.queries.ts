import {useQuery} from '@tanstack/react-query';
import {promotionApi} from './promotion.api';
import {promotionKeys} from './promotion.keys';

export function useVouchers(restaurantId: string | null) {
  return useQuery({
    queryKey: promotionKeys.vouchers(restaurantId),
    queryFn: () => promotionApi.listVouchers(restaurantId),
    /**
     * Vouchers barely change within a session -> cache for 5 minutes.
     * That matters because the voucher picker may be opened and closed repeatedly.
     */
    staleTime: 5 * 60_000,
  });
}
