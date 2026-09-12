import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {secureMmkvStorage} from '@core/storage/zustand-persist';
import {appEventBus} from '@core/events/app-event-bus';
import type {AuthStatus, Session} from '../model/types';

/**
 * THE AUTH STORE — an example of CLIENT STATE (Zustand), not server state.
 *
 * Why the session does not use TanStack Query: it is not data we "fetch and cache".
 * It is state the app owns itself, it decides the whole navigation tree, and it has
 * to survive app restarts.
 *
 * Stored in the `secure` partition rather than the normal one — tokens do not share
 * space with the cart.
 */
interface AuthState {
  session: Session | null;
  status: AuthStatus;
  /** Whether persisted data has been read — avoids flashing Login at startup. */
  hasHydrated: boolean;

  setSession: (session: Session) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      session: null,
      status: 'unauthenticated',
      hasHydrated: false,

      setSession: session => {
        set({session, status: 'authenticated'});
        appEventBus.emit('auth:logged-in', {userId: session.user.id});
      },

      logout: () => {
        set({session: null, status: 'unauthenticated'});
        // Emit an event instead of clearing the cart by hand here.
        // auth must NOT know that cart exists — see app/bootstrap for who
        // listens to this event.
        appEventBus.emit('auth:logged-out', undefined);
      },

      setHasHydrated: value => set({hasHydrated: value}),
    }),
    {
      name: 'foodgo.auth',
      storage: createJSONStorage(() => secureMmkvStorage),
      /** Persist only the session; `hasHydrated` is per-run temporary state. */
      partialize: state => ({session: state.session}),
      /** Restore `status` from the session once storage has been read. */
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          state?.setHasHydrated(true);
          return;
        }
        if (state) {
          state.status = state.session ? 'authenticated' : 'unauthenticated';
          state.setHasHydrated(true);
        }
      },
      version: 1,
    },
  ),
);

/**
 * Primitive selectors — they return a string/boolean instead of an object.
 *
 * Why it matters: zustand compares with Object.is. If a selector returns a new
 * object every time, the component re-renders pointlessly on EVERY store change.
 */
export const selectAccessToken = (state: AuthState): string | null =>
  state.session?.accessToken ?? null;

export const selectIsAuthenticated = (state: AuthState): boolean =>
  state.status === 'authenticated';
