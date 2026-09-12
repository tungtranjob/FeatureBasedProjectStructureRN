import {QueryClient} from '@tanstack/react-query';
import {AppError} from '@shared/errors/app-error';

/**
 * TANSTACK QUERY CONFIG — the caching strategy for ALL server state.
 *
 * ⭐ THIS PROJECT'S TAKE ON STATE MANAGEMENT (worth reading closely):
 *
 *   Server state (restaurant list, menus, orders) -> TanStack Query.
 *     Traits: the app does not own it, it can go stale, it needs cache/refetch/retry.
 *
 *   Client state (cart, session, checkout draft) -> Zustand.
 *     Traits: the app owns it outright; there is no server copy to sync with.
 *
 * Stuffing server state into Zustand is the most common mistake: you end up
 * reimplementing loading/error/cache/refetch/dedupe by hand — i.e. rewriting
 * TanStack Query, but buggy.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * For 60 seconds the data counts as "fresh". Within that window, returning
       * to a previous screen reads straight from cache with no network call -> smooth.
       */
      staleTime: 60_000,

      /** Keep the cache for 5 minutes after the last component stops using it. */
      gcTime: 5 * 60_000,

      /**
       * Only retry network/server errors. Retrying a 422 (bad payload) is pointless:
       * it just makes the user wait longer for the same error.
       */
      retry: (failureCount, error) => {
        if (error instanceof AppError && !error.isRetryable) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000),

      /**
       * Mobile differs from web: there is no "window focus". We control refetching
       * ourselves with React Navigation's useFocusEffect where it matters.
       */
      refetchOnWindowFocus: false,
    },
    mutations: {
      // NEVER auto-retry a mutation: placing an order twice costs real money.
      // Safe retries require an idempotency key (see PlaceOrderRequestDto).
      retry: false,
    },
  },
});
