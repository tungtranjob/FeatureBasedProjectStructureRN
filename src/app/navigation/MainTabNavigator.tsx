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
 * The bottom tab bar.
 *
 * This file lives in app/ rather than inside a feature, because it is where the
 * features MEET. That is exactly the composition root's job: only it knows about
 * all of them, while the features know nothing about each other.
 */
export function MainTabNavigator() {
  // The cart badge reads from cart — the tab navigator is a legitimate place for
  // this because it belongs to the app layer.
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
