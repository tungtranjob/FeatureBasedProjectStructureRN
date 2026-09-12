import {authTokenBridge} from '@core/api/auth-token';
import {logger} from '@core/logger/logger';
import {forceLogout, getAccessToken} from '@features/auth';
import {registerEventHandlers} from './register-event-handlers';

/**
 * App initialisation — runs ONCE before the first render.
 *
 * Returns a cleanup function so Fast Refresh does not multiply listeners.
 */
export function bootstrap(): () => void {
  logger.info('App', 'Bootstrap');

  /**
   * ⭐ DEPENDENCY INVERSION, WIRED UP HERE.
   *
   * http-client (core) needs the token, but core may not import a feature.
   * Here — in app/, the one place allowed to know about both — we plug them together.
   *
   * That keeps core/ reusable in another app that has no auth feature, and leaves
   * the dependency graph free of cycles.
   */
  authTokenBridge.setTokenProvider(getAccessToken);
  authTokenBridge.setUnauthorizedHandler(forceLogout);

  const unregisterEvents = registerEventHandlers();

  // Where the other startup steps would go in a real app:
  //   initSentry();
  //   initPushNotifications();
  //   initAnalytics();
  //   await SplashScreen.hideAsync();

  return () => {
    unregisterEvents();
  };
}

export {registerEventHandlers};
