import React from 'react';
import {QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';
import {queryClient} from '@core/api/query-client';
import {AppErrorBoundary} from './AppErrorBoundary';

/**
 * Every provider gathered in one place.
 *
 * ⚠️ THE NESTING ORDER MATTERS:
 *   GestureHandlerRootView must be outermost (the library requires it).
 *   ErrorBoundary sits OUTSIDE QueryClientProvider so it also catches errors thrown
 *   by the inner providers themselves.
 *   SafeAreaProvider must wrap anything that uses useSafeAreaInsets.
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
