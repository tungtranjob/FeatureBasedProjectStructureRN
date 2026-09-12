import {Platform} from 'react-native';

/**
 * Reads the current platform.
 *
 * This file lives in lib/ and NOT in model/, and there is a lesson in that:
 * dependency-cruiser caught the mistake when Platform was imported directly into
 * model/payment-method.registry.ts (rule "model-must-be-pure").
 *
 * Why it matters: model/ must be pure functions that take everything as parameters.
 * Once it reads global state like Platform.OS, you can no longer test the iOS branch
 * on a machine running Android — and that test is exactly what catches the
 * "Apple Pay shows on Android" bug.
 *
 * The fix: model takes `platform` as a REQUIRED PARAMETER; the calling layer (a hook
 * or a component) is where the real value is read from the OS.
 */
export type AppPlatform = 'ios' | 'android';

export const getCurrentPlatform = (): AppPlatform =>
  Platform.OS === 'ios' ? 'ios' : 'android';
