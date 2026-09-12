/** PUBLIC API của feature restaurant. */
export {HomeScreen} from './screens/HomeScreen';
export {RestaurantDetailScreen} from './screens/RestaurantDetailScreen';
export {RESTAURANT_ROUTES} from './navigation/restaurant.routes';
export type {RestaurantStackParamList} from './navigation/restaurant.routes';

// Feature khác (checkout) cần đọc thông tin nhà hàng để tính phí giao và
// kiểm tra đơn tối thiểu -> export hook + kiểu, KHÔNG export api client.
export {useRestaurant} from './api/restaurant.queries';
export {canOrderFrom, getAvailability} from './model/availability';
export type {Restaurant} from './model/types';
