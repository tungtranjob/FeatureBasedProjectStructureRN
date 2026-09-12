import {useMutation} from '@tanstack/react-query';
import {useShallow} from 'zustand/react/shallow';
import {authApi} from '../api/auth.api';
import {useAuthStore} from '../store/auth.store';

/**
 * The auth feature's public hook. Screens never touch the store directly —
 * they go through this hook. That lets us change how the session is stored
 * (zustand -> context -> redux) without editing a single line in a screen.
 */
export function useAuth() {
  // useShallow: compares field by field, avoiding a re-render when the object is new
  // but its contents have not changed.
  const {user, status, hasHydrated, logout} = useAuthStore(
    useShallow(state => ({
      user: state.session?.user ?? null,
      status: state.status,
      hasHydrated: state.hasHydrated,
      logout: state.logout,
    })),
  );

  return {
    user,
    status,
    hasHydrated,
    isAuthenticated: status === 'authenticated',
    logout,
  };
}

/**
 * The login mutation.
 *
 * Is logging in server state? No — it is an ACTION. We use useMutation to get
 * isPending/error for free, and write the result into the Zustand store because
 * the session is long-lived client state.
 */
export function useLogin() {
  const setSession = useAuthStore(state => state.setSession);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: session => setSession(session),
  });
}
