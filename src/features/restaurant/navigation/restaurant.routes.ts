export const RESTAURANT_ROUTES = {
  Home: 'Home',
  RestaurantDetail: 'RestaurantDetail',
} as const;

/**
 * ParamList của RIÊNG feature này.
 *
 * app/navigation/types.ts sẽ hợp nhất ParamList của tất cả feature lại.
 * Nhờ cách này, thêm một màn hình mới KHÔNG cần sửa file type tập trung —
 * bạn khai báo ngay tại feature sở hữu nó.
 */
export type RestaurantStackParamList = {
  [RESTAURANT_ROUTES.Home]: undefined;
  [RESTAURANT_ROUTES.RestaurantDetail]: {restaurantId: string};
};
