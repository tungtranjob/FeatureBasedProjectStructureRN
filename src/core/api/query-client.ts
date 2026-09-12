import {QueryClient} from '@tanstack/react-query';
import {AppError} from '@shared/errors/app-error';

/**
 * CẤU HÌNH TANSTACK QUERY — chiến lược cache cho TOÀN BỘ server state.
 *
 * ⭐ QUAN ĐIỂM QUẢN LÝ STATE CỦA DỰ ÁN NÀY (đọc kỹ phần này):
 *
 *   Server state (danh sách nhà hàng, menu, đơn hàng) -> TanStack Query.
 *     Đặc điểm: app không sở hữu nó, nó có thể cũ đi, cần cache/refetch/retry.
 *
 *   Client state (giỏ hàng, phiên đăng nhập, nháp checkout) -> Zustand.
 *     Đặc điểm: app sở hữu hoàn toàn, không có bản gốc trên server để đồng bộ.
 *
 * Nhét server state vào Zustand là sai lầm phổ biến nhất: bạn sẽ phải tự
 * viết lại loading/error/cache/refetch/dedupe — tức là viết lại TanStack
 * Query, nhưng đầy bug.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * 60 giây coi như dữ liệu còn "tươi". Trong khoảng này, quay lại
       * màn hình cũ sẽ lấy ngay từ cache, không gọi mạng -> app mượt.
       */
      staleTime: 60_000,

      /** Giữ cache 5 phút sau khi không còn component nào dùng. */
      gcTime: 5 * 60_000,

      /**
       * Chỉ retry lỗi mạng/server. Retry lỗi 422 (dữ liệu sai) là vô nghĩa,
       * chỉ làm user chờ lâu hơn rồi vẫn thấy đúng lỗi đó.
       */
      retry: (failureCount, error) => {
        if (error instanceof AppError && !error.isRetryable) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000),

      /**
       * Mobile khác web: không có "focus cửa sổ". Ta tự kiểm soát việc
       * refetch bằng useFocusEffect của React Navigation ở nơi cần.
       */
      refetchOnWindowFocus: false,
    },
    mutations: {
      // KHÔNG BAO GIỜ tự retry mutation: đặt đơn 2 lần là mất tiền thật.
      // Muốn retry an toàn thì phải có idempotency key (xem PlaceOrderRequestDto).
      retry: false,
    },
  },
});
