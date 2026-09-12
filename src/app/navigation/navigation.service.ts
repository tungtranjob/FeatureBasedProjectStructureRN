import {createNavigationContainerRef} from '@react-navigation/native';
import type {RootStackParamList} from './types';

/**
 * Navigating from OUTSIDE the React tree.
 *
 * Needed for situations where no component is at hand:
 *  - The user taps a push notification.
 *  - An event bus listener in app/bootstrap.
 *  - The interceptor catching a 401 and needing to bounce to the login screen.
 *
 * ⚠️ Always check isReady(): navigating before NavigationContainer has mounted
 * silently does nothing — a nasty bug to track down because there is no warning.
 */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigate = <T extends keyof RootStackParamList>(
  ...args: undefined extends RootStackParamList[T]
    ? [screen: T] | [screen: T, params: RootStackParamList[T]]
    : [screen: T, params: RootStackParamList[T]]
): void => {
  if (navigationRef.isReady()) {
    // @ts-expect-error — navigate's variadic signature is hard to express precisely
    navigationRef.navigate(...args);
  }
};

export const resetToHome = (): void => {
  if (navigationRef.isReady()) {
    navigationRef.reset({index: 0, routes: [{name: 'MainTabs'}]});
  }
};
