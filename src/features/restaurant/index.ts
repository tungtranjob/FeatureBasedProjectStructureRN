/** The restaurant feature's PUBLIC API. */
export {HomeScreen} from './screens/HomeScreen';
export {RestaurantDetailScreen} from './screens/RestaurantDetailScreen';
export {RESTAURANT_ROUTES} from './navigation/restaurant.routes';
export type {RestaurantStackParamList} from './navigation/restaurant.routes';

// Another feature (checkout) needs restaurant details to compute the delivery fee and
// check the minimum order -> export the hook + types, NOT the api client.
export {useRestaurant} from './api/restaurant.queries';
export {canOrderFrom, getAvailability} from './model/availability';
export type {Restaurant} from './model/types';
