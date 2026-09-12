import {logger} from '../logger/logger';
import type {AppEventName, AppEvents} from './app-events';

/**
 * EVENT BUS — how two features "talk" without knowing about each other.
 *
 * When to use an event instead of a direct import:
 *  - Several parties care about the same thing (payment done -> cart + order +
 *    navigation + analytics all need to react).
 *  - The emitter does NOT need a result and does not need to wait.
 *  - You want to avoid a backwards dependency (payment should not know cart exists).
 *
 * When NOT to use one:
 *  - You need a return value right away -> call the function/hook directly.
 *  - Only one place listens -> the event makes the code hard to trace for no gain.
 *
 * Hand-written in ~40 lines rather than adding a dependency: it is enough, and there
 * is nothing mysterious about it when you need to debug.
 */
type Listener<K extends AppEventName> = (payload: AppEvents[K]) => void;

/**
 * Internally listeners are stored untyped and cast at the boundary (in `on` and
 * `emit`). TypeScript cannot prove that Set<Listener<K>> lines up with a mapped
 * type over K, so insisting on strict types in here would mean wrapping everything
 * in elaborate generics for no extra safety.
 *
 * The REAL type safety lives in the public signatures of `on`/`emit` — the part API
 * users touch. The inside is an implementation detail.
 */
type UnknownListener = (payload: unknown) => void;

const listeners = new Map<AppEventName, Set<UnknownListener>>();

export const appEventBus = {
  /** Returns an unsubscribe function — ALWAYS call it in the useEffect cleanup. */
  on<K extends AppEventName>(event: K, listener: Listener<K>): () => void {
    let set = listeners.get(event);
    if (!set) {
      set = new Set();
      listeners.set(event, set);
    }
    const wrapped = listener as UnknownListener;
    set.add(wrapped);
    return () => {
      set?.delete(wrapped);
    };
  },

  emit<K extends AppEventName>(event: K, payload: AppEvents[K]): void {
    logger.debug('EventBus', `emit ${event}`, payload);
    const set = listeners.get(event);
    if (!set || set.size === 0) {
      return;
    }
    // Copy into an array before iterating: a listener may unsubscribe itself
    // while running, and mutating a Set mid-iteration causes hard-to-trace bugs.
    for (const listener of Array.from(set)) {
      try {
        (listener as Listener<K>)(payload);
      } catch (error) {
        // One failing listener must NOT kill the remaining listeners.
        logger.error('EventBus', `listener của "${event}" ném lỗi`, error);
      }
    }
  },

  /** Used in tests to reset between cases. */
  reset(): void {
    listeners.clear();
  },
};
