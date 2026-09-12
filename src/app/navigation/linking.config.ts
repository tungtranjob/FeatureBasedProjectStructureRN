import type {LinkingOptions} from '@react-navigation/native';
import {env} from '@core/config/env';
import {paymentLinking} from '@features/payment';
import {orderLinking} from '@features/order';
import type {RootStackParamList} from './types';

/**
 * DEEP LINK — gom mảnh cấu hình từ từng feature.
 *
 * Mỗi feature khai báo phần đường dẫn của mình ngay cạnh màn hình xử lý nó
 * (xem features/payment/navigation/payment.routes.ts). File này chỉ ghép.
 *
 * Cần khai báo thêm ở tầng native, nếu không deep link sẽ không bao giờ tới:
 *   iOS     — ios/FoodGo/Info.plist > CFBundleURLTypes
 *   Android — android/app/src/main/AndroidManifest.xml > intent-filter
 *
 * Thử nhanh mà không cần cổng thanh toán thật:
 *   iOS:     xcrun simctl openurl booted "foodgo://payment/return"
 *   Android: adb shell am start -W -a android.intent.action.VIEW \
 *              -d "foodgo://payment/return" com.foodgo
 */
export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [`${env.deeplinkScheme}://`, 'https://foodgo.vn'],
  config: {
    screens: {
      ...paymentLinking,
      ...orderLinking,
      MainTabs: {
        screens: {
          Home: 'home',
          OrderList: 'orders',
          Profile: 'profile',
        },
      },
    },
  },
};
