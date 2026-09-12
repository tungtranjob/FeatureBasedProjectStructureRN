import {useEffect, useRef} from 'react';
import {AppState, type AppStateStatus} from 'react-native';

/**
 * Calls a callback when the app changes state (background <-> foreground).
 *
 * This hook is CRITICAL for the payment flow: when the user leaves for MoMo and
 * comes back, sometimes NO deep link fires at all (they pressed the back button
 * themselves). In that case the 'active' event is the only signal we get.
 */
export function useAppState(
  onChange: (next: AppStateStatus, previous: AppStateStatus) => void,
): void {
  const previous = useRef(AppState.currentState);
  // Keep the callback in a ref so we do not detach/reattach the listener on every render.
  const callback = useRef(onChange);
  callback.current = onChange;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', next => {
      const prev = previous.current;
      previous.current = next;
      callback.current(next, prev);
    });
    return () => subscription.remove();
  }, []);
}
