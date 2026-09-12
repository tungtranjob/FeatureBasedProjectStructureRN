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
 * ⭐ COMPOSITION ROOT CỦA ĐIỀU HƯỚNG.
 *
 * Đây là file DUY NHẤT trong app import từ mọi feature. Nhìn danh sách
 * import ở trên là thấy ngay app có những feature nào — một dạng tài liệu
 * kiến trúc tự cập nhật.
 *
 * Cấu trúc: một stack phẳng thay vì lồng nhiều navigator. Với app cỡ này
 * nó đơn giản hơn hẳn, và việc điều hướng chéo giữa các feature (checkout
 * -> payment -> order) không phải đi xuyên qua nhiều lớp navigator.
 */
export function RootNavigator() {
  const {isAuthenticated, hasHydrated} = useAuth();

  /**
   * Chờ đọc xong session từ đĩa trước khi quyết định hiện màn nào.
   *
   * Bỏ qua bước này là người dùng thấy màn Login nháy một cái rồi mới vào
   * app — lỗi kinh điển của mọi app có persist auth, và trông rất thiếu
   * chuyên nghiệp.
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
              // Trình bày dạng modal: người dùng đang "tạm dừng" luồng duyệt
              // menu để tuỳ chỉnh một món, chứ không đi sâu thêm một cấp.
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
                // Ẩn nút back trên header. Việc chặn back cứng/vuốt do
                // useBackHandlerGuard bên trong màn hình đảm nhiệm.
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
