export const RESTAURANT_ROUTES = {
  Home: 'Home',
  RestaurantDetail: 'RestaurantDetail',
} as const;

/**
 * The ParamList belonging to THIS feature alone.
 *
 * app/navigation/types.ts merges every feature's ParamList together.
 * Because of that, adding a new screen requires NO edit to a central type file —
 * you declare it right in the feature that owns it.
 */
export type RestaurantStackParamList = {
  [RESTAURANT_ROUTES.Home]: undefined;
  [RESTAURANT_ROUTES.RestaurantDetail]: {restaurantId: string};
};
