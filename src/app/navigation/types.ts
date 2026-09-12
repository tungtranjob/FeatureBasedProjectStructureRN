import type {NavigatorScreenParams} from '@react-navigation/native';
import type {AuthStackParamList} from '@features/auth';
import type {RestaurantStackParamList} from '@features/restaurant';
import type {MenuStackParamList} from '@features/menu';
import type {CartStackParamList} from '@features/cart';
import type {CheckoutStackParamList} from '@features/checkout';
import type {AddressStackParamList} from '@features/address';
import type {PaymentStackParamList} from '@features/payment';
import type {OrderStackParamList} from '@features/order';

/**
 * ⭐ THE MERGED PARAM LIST OF EVERY FEATURE.
 *
 * Each feature declares its own ParamList right next to the screens it owns.
 * This file only JOINS them with an intersection (&).
 *
 * The benefit: adding a new screen requires NO edit to a central type file.
 * You declare it in the feature and it shows up here automatically. That is a big
 * difference from hand-writing the whole ParamList in one file — which turns the
 * type file into a merge-conflict bottleneck for the whole team.
 */
export type MainTabParamList = {
  Home: undefined;
  OrderList: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
} & AuthStackParamList &
  RestaurantStackParamList &
  MenuStackParamList &
  CartStackParamList &
  CheckoutStackParamList &
  AddressStackParamList &
  PaymentStackParamList &
  OrderStackParamList;

/**
 * ⭐ GLOBAL TYPE AUGMENTATION — a key trick for feature-first code.
 *
 * This declaration gives `useNavigation()` WITH NO TYPE ARGUMENT full typing
 * everywhere in the app.
 *
 * Why it is needed: features may NOT import from app/ (dependency-cruiser blocks it).
 * Without the augmentation, every screen in a feature would have to write
 * `useNavigation<NativeStackNavigationProp<RootStackParamList>>()` — and
 * RootStackParamList lives in app/. Deadlock.
 *
 * The augmentation unties that knot: the type is "injected" globally, so a feature
 * only calls `useNavigation()` and still gets full type checking.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
