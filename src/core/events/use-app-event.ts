import {useEffect, useRef} from 'react';
import {appEventBus} from './app-event-bus';
import type {AppEventName, AppEvents} from './app-events';

/**
 * Subscribes to an event from inside a React component.
 *
 * It keeps the latest handler in a ref, so you do not need to wrap the handler in
 * useCallback and the listener is not detached/reattached on every render.
 */
export function useAppEvent<K extends AppEventName>(
  event: K,
  handler: (payload: AppEvents[K]) => void,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(
    () => appEventBus.on(event, payload => handlerRef.current(payload)),
    [event],
  );
}
