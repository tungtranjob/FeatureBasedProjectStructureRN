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
     * ⭐ POLLING CÓ ĐIỀU KIỆN — kỹ thuật rất hữu ích cho màn theo dõi đơn.
     *
     * refetchInterval nhận được dữ liệu hiện tại, nên ta tự quyết định:
     *   - Đơn đang chạy  -> hỏi lại mỗi 10 giây để thấy trạng thái nhảy.
     *   - Đơn đã xong/huỷ -> false, ngừng hẳn.
     *
     * Nếu để một con số cố định, app sẽ ngốn pin và dữ liệu di động để hỏi
     * lại mãi một đơn đã hoàn tất từ tuần trước.
     *
     * (Production nên dùng WebSocket/push thay vì polling. Polling là giải
     * pháp đơn giản và đủ tốt để khởi đầu.)
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
       * Cập nhật cache trực tiếp bằng dữ liệu server vừa trả về, thay vì
       * invalidate rồi gọi lại mạng. Kết quả: UI đổi ngay lập tức và tiết
       * kiệm một request.
       */
      queryClient.setQueryData(orderKeys.detail(order.id), order);
      // Danh sách thì invalidate, vì thứ tự/bộ lọc có thể đã khác.
      void queryClient.invalidateQueries({queryKey: orderKeys.lists()});
    },
  });
}

/**
 * Đặt đơn.
 *
 * Đặt ở feature `order` (không phải `checkout`) vì đây là thao tác tạo ra
 * một Order, và order là feature sở hữu khái niệm đó cùng mapper của nó.
 * checkout chỉ gom dữ liệu rồi gọi hook này.
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
    // KHÔNG retry: xem ghi chú trong core/api/query-client.ts.
    // An toàn duy nhất là retry kèm idempotencyKey, và ta để người dùng
    // chủ động bấm lại thay vì tự động.
  });
}
