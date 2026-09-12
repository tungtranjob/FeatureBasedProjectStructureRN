/**
 * THE AUTH FEATURE'S PUBLIC API.
 *
 * This is the contract with the rest of the app. Anything NOT listed here is
 * auth's private business and can change freely without affecting anyone.
 *
 * Note: `useAuthStore` is NOT exported. If another feature could reach the store,
 * we would lose control and it would end up mutated from 20 different places.
 * The only exception is `getAccessTokenForBridge` — used by app/bootstrap to plug
 * the token into http-client.
 */
export {LoginScreen} from './screens/LoginScreen';
export {ProfileScreen} from './screens/ProfileScreen';
export {AUTH_ROUTES} from './navigation/auth.routes';
export type {AuthStackParamList} from './navigation/auth.routes';
export {useAuth, useLogin} from './hooks/use-auth';
export type {AuthUser, AuthStatus} from './model/types';

import {useAuthStore, selectAccessToken} from './store/auth.store';

/** Reads the token outside the React tree (for http-client). Only app/bootstrap uses it. */
export const getAccessToken = (): string | null =>
  selectAccessToken(useAuthStore.getState());

/** Signs out from outside the React tree (when the server returns 401). */
export const forceLogout = (): void => useAuthStore.getState().logout();
