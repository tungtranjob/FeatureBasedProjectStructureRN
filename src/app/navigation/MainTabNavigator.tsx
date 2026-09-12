import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Txt} from '@shared/ui';
import {colors} from '@shared/theme';
import {HomeScreen} from '@features/restaurant';
import {OrderListScreen} from '@features/order';
import {ProfileScreen} from '@features/auth';
import {useCartBadge} from '@features/cart';
import type {MainTabParamList} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Thanh tab dưới cùng.
 *
 * File này nằm ở app/ chứ không nằm trong feature nào, vì nó là nơi các
 * feature GẶP NHAU. Đây chính là vai trò của composition root: chỉ nó biết
 * tất cả, còn các feature không biết nhau.
 */
export function MainTabNavigator() {
  // Badge giỏ hàng đọc từ cart — tab navigator là chỗ hợp lệ để làm việc
  // này vì nó vốn thuộc tầng app.
  const cartCount = useCartBadge();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Khám phá',
          tabBarIcon: ({focused}) => (
            <Txt style={{fontSize: focused ? 22 : 20}}>🍜</Txt>
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />
      <Tab.Screen
        name="OrderList"
        component={OrderListScreen}
        options={{
          title: 'Đơn hàng',
          tabBarIcon: ({focused}) => (
            <Txt style={{fontSize: focused ? 22 : 20}}>🧾</Txt>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({focused}) => (
            <Txt style={{fontSize: focused ? 22 : 20}}>👤</Txt>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
