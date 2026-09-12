/**
 * THE TOKEN BRIDGE BETWEEN core/ AND features/auth.
 *
 * The problem: http-client (core) needs the access token for the Authorization header.
 * But the token is held by the auth store (a feature), and core is NOT ALLOWED to
 * import a feature — doing so breaks the dependency direction and creates a cycle.
 *
 * The fix: dependency inversion. core defines this "socket", and app/bootstrap is
 * where the auth store gets plugged into it. core still does not know the auth store
 * exists; it only knows there is a function returning a string.
 */
type TokenProvider = () => string | null;

let provider: TokenProvider = () => null;
let onUnauthorized: () => void = () => {};

export const authTokenBridge = {
  /** Called from app/bootstrap with a function that reads the token from the auth store. */
  setTokenProvider(next: TokenProvider): void {
    provider = next;
  },
  /** Called when the server returns 401 — the auth feature signs the user out. */
  setUnauthorizedHandler(next: () => void): void {
    onUnauthorized = next;
  },
  getToken: (): string | null => provider(),
  notifyUnauthorized: (): void => onUnauthorized(),
};
