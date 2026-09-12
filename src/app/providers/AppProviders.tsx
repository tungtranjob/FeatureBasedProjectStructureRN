import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import {queryClient} from '@core/api/query-client';
import {AppErrorBoundary} from './AppErrorBoundary';

/**
 * Gom mọi provider vào một chỗ.
 *
 * ⚠️ THỨ TỰ LỒNG NHAU CÓ Ý NGHĨA:
 *   GestureHandlerRootView phải ở ngoài cùng (yêu cầu của thư viện).
 *   ErrorBoundary đặt NGOÀI QueryClientProvider, để nó bắt được cả lỗi phát
 *   sinh từ chính provider bên trong.
 *   SafeAreaProvider phải bao ngoài mọi thứ dùng useSafeAreaInsets.
 */
export function AppProviders({children}: {children: React.ReactNode}) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SafeAreaProvider>{children}</SafeAreaProvider>
        </QueryClientProvider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
});
