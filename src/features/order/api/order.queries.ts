import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {appEventBus} from '@core/events/app-event-bus';
import {orderApi} from './order.api';
import {orderKeys} from './order.keys';
import {isActiveOrder} from '../model/order-rules';

export function useOrders() {
  return useQuery({
    queryKey: orderKeys.list(),
    queryFn: orderApi.list,
    staleTime: 15_000,
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(id ?? ''),
    queryFn: () => orderApi.detail(id as string),
    enabled: Boolean(id),

    /**
     * ⭐ CONDITIONAL POLLING — a very useful technique for an order tracking screen.
     *
     * refetchInterval receives the current data, so we decide for ourselves:
     *   - Order in progress -> re-ask every 10 seconds so the status visibly advances.
     *   - Order done/cancelled -> false, stop entirely.
     *
     * With a fixed number, the app would burn battery and mobile data re-asking about
     * an order that completed last week.
     *
     * (Production should use WebSockets/push instead of polling. Polling is the simple
     * solution and it is good enough to start with.)
     */
    refetchInterval: query => {
      const order = query.state.data;
      return order && isActiveOrder(order) ? 10_000 : false;
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => orderApi.cancel(orderId),
    onSuccess: order => {
      /**
       * Update the cache directly with the data the server just returned, instead of
       * invalidating and making another network call. The result: the UI changes
       * instantly and we save a request.
       */
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      // The list does get invalidated, because its order/filters may have changed.
      void queryClient.invalidateQueries({queryKey: orderKeys.lists()});
    },
  });
}

/**
 * Places an order.
 *
 * It lives in the `order` feature (not `checkout`) because this is the operation that
 * creates an Order, and order owns that concept along with its mapper.
 * checkout only gathers the data and calls this hook.
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orderApi.place,
    onSuccess: ({order}) => {
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      void queryClient.invalidateQueries({queryKey: orderKeys.lists()});

      appEventBus.emit('order:placed', {
        orderId: order.id,
        orderCode: order.code,
        total: order.fees.total,
      });
    },
    // NO retry: see the note in core/api/query-client.ts.
    // The only safe retry is one carrying the idempotencyKey, and we let the user
    // choose to tap again rather than doing it automatically.
  });
}
