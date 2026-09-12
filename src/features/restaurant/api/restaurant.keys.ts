/**
 * QUERY KEY FACTORY.
 *
 * Query key là "địa chỉ" của dữ liệu trong cache TanStack Query. Gõ tay
 * mảng key ở từng chỗ là con đường ngắn nhất tới bug "sao invalidate rồi mà
 * màn hình không cập nhật" — vì bạn invalidate ['restaurant'] trong khi
 * query đăng ký dưới key ['restaurants'].
 *
 * Cấu trúc phân cấp cho phép invalidate theo tầng:
 *   invalidateQueries({queryKey: restaurantKeys.all})   -> xoá mọi thứ
 *   invalidateQueries({queryKey: restaurantKeys.lists()}) -> chỉ các danh sách
 */
export const restaurantKeys = {
  all: ['restaurants'] as const,

  lists: () => [...restaurantKeys.all, 'list'] as const,
  list: (filters: {search?: string; cuisine?: string}) =>
    [...restaurantKeys.lists(), filters] as const,

  details: () => [...restaurantKeys.all, 'detail'] as const,
  detail: (id: string) => [...restaurantKeys.details(), id] as const,
};
