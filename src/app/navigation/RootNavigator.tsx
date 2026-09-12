import React from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {colors} from '@shared/theme';
import {LoginScreen, useAuth} from '@features/auth';
import {RestaurantDetailScreen} from '@features/restaurant';
import {ItemDetailScreen} from '@features/menu';
import {CartScreen} from '@features/cart';
import {CheckoutScreen, VoucherPickerScreen} from '@features/checkout';
import {AddressPickerScreen} from '@features/address';
import {PaymentProcessingScreen} from '@features/payment';
import {OrderDetailScreen} from '@features/order';
import {MainTabNavigator} from './MainTabNavigator';
import {linkingConfig} from './linking.config';
import {navigationRef} from './navigation.service';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * ⭐ THE COMPOSITION ROOT OF NAVIGATION.
 *
 * This is the ONLY file in the app that imports from every feature. The import list
 * above tells you at a glance which features the app has — a form of architecture
 * documentation that keeps itself up to date.
 *
 * Structure: one flat stack instead of nested navigators. At this app's size that is
 * considerably simpler, and navigating across features (checkout -> payment -> order)
 * does not have to cross several navigator layers.
 */
export function RootNavigator() {
  const {isAuthenticated, hasHydrated} = useAuth();

  /**
   * Wait until the session has been read from disk before deciding which screen to show.
   *
   * Skip this and the user sees the Login screen flash before landing in the app —
   * the classic bug in every app with persisted auth, and it looks distinctly
   * unprofessional.
   */
  if (!hasHydrated) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} linking={linkingConfig}>
      <Stack.Navigator
        screenOptions={{
          headerBackTitle: 'Quay lại',
          headerTintColor: colors.text,
          contentStyle: {backgroundColor: colors.background},
        }}>
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="RestaurantDetail"
              component={RestaurantDetailScreen}
              options={{title: ''}}
            />
            <Stack.Screen
              name="ItemDetail"
              component={ItemDetailScreen}
              // Presented as a modal: the user is "pausing" the menu browsing flow
              // to customise an item, not going one level deeper.
              options={{presentation: 'modal', title: 'Tuỳ chọn món'}}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{title: 'Giỏ hàng'}}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{title: 'Thanh toán'}}
            />
            <Stack.Screen
              name="VoucherPicker"
              component={VoucherPickerScreen}
              options={{presentation: 'modal', title: 'Chọn khuyến mãi'}}
            />
            <Stack.Screen
              name="AddressPicker"
              component={AddressPickerScreen}
              options={{presentation: 'modal', title: 'Chọn địa chỉ'}}
            />
            <Stack.Screen
              name="PaymentProcessing"
              component={PaymentProcessingScreen}
              options={{
                title: 'Thanh toán',
                // Hide the header back button. Blocking the hardware back button and
                // the back swipe is handled by useBackHandlerGuard inside the screen.
                headerBackVisible: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="OrderDetail"
              component={OrderDetailScreen}
              options={{title: 'Chi tiết đơn hàng'}}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
