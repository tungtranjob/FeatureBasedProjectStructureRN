/**
 * Route names as constants instead of strings scattered everywhere.
 *
 * Mistype `navigate(AUTH_ROUTES.Login)` and TypeScript tells you immediately;
 * mistype `navigate('Login')` as 'Logn' and it only breaks at runtime.
 */
export const AUTH_ROUTES = {
  Login: 'Login',
  Profile: 'Profile',
} as const;

export type AuthStackParamList = {
  [AUTH_ROUTES.Login]: undefined;
  [AUTH_ROUTES.Profile]: undefined;
};
