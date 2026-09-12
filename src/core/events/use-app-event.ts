import {useEffect, useRef} from 'react';
import {appEventBus} from './app-event-bus';
import type {AppEventName, AppEvents} from './app-events';

/**
 * Lắng nghe event bên trong component React.
 *
 * Dùng ref để giữ handler mới nhất, nhờ vậy bạn không cần bọc handler trong
 * useCallback và listener cũng không bị gỡ/gắn lại mỗi lần render.
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
