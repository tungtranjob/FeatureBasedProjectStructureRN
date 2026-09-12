import type {LinkingOptions} from '@react-navigation/native';
import {env} from '@core/config/env';
import {paymentLinking} from '@features/payment';
import {orderLinking} from '@features/order';
import type {RootStackParamList} from './types';

/**
 * DEEP LINKS — assembled from the fragments each feature declares.
 *
 * Every feature declares its own path segment right next to the screen that handles it
 * (see features/payment/navigation/payment.routes.ts). This file only stitches them together.
 *
 * Extra native declarations are required, otherwise deep links never arrive:
 *   iOS     — ios/FoodGo/Info.plist > CFBundleURLTypes
 *   Android — android/app/src/main/AndroidManifest.xml > intent-filter
 *
 * A quick test without a real payment gateway:
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
