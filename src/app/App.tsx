import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import {bootstrap} from './bootstrap';
import {AppProviders} from './providers/AppProviders';
import {RootNavigator} from './navigation/RootNavigator';

/**
 * Component gốc.
 *
 * Nó cố tình ngắn: mọi thứ phức tạp đã được đẩy vào bootstrap/, providers/
 * và navigation/. Một App.tsx dài là dấu hiệu app đang thiếu chỗ để đặt
 * những thứ đó.
 */
export function App() {
  useEffect(() => bootstrap(), []);

  return (
    <AppProviders>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </AppProviders>
  );
}
