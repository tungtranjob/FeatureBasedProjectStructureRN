/**
 * Tên route dạng hằng số thay vì chuỗi rải rác.
 *
 * `navigate(AUTH_ROUTES.Login)` gõ sai là TypeScript báo ngay;
 * `navigate('Login')` gõ sai thành 'Logn' thì chỉ chết lúc runtime.
 */
export const AUTH_ROUTES = {
  Login: 'Login',
  Profile: 'Profile',
} as const;

export type AuthStackParamList = {
  [AUTH_ROUTES.Login]: undefined;
  [AUTH_ROUTES.Profile]: undefined;
};
