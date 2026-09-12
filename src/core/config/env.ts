/**
 * Runtime configuration — a single place.
 *
 * In a real project these values come from react-native-config (.env) or from
 * the build variant. They are hardcoded here for brevity, but THE IMPORTANT
 * PART still holds: no component reads process.env / Config directly, everything
 * goes through this typed object. Changing the config source means editing 1 file.
 */
export const env = {
  /**
   * Turns the mock API on/off.
   *
   * This switch shows why the api/ layer is separated:
   * flip it to `false` and the whole app talks to the real backend with NO feature
   * file changed, because a feature only knows `http.get(...)` and not where the
   * data comes from.
   */
  useMockApi: true,

  apiBaseUrl: 'https://api.foodgo.vn',

  /** Scheme used by the deep link that returns from the payment gateway. */
  deeplinkScheme: 'foodgo',

  /** Fake network latency so loading/skeleton UI can actually be exercised. */
  mock: {
    minLatencyMs: 250,
    maxLatencyMs: 700,
    /**
     * Share of mock requests that fail (0 = never fail).
     * Raise it to 0.2 to see how ErrorView and the "Thử lại" button behave.
     */
    failureRate: 0,
  },
} as const;
