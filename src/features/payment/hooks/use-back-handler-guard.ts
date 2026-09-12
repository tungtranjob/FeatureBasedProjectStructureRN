import {useEffect} from 'react';
import {BackHandler} from 'react-native';
import {useNavigation} from '@react-navigation/native';

/**
 * Stops the user leaving a screen during an operation that must not be interrupted.
 *
 * BOTH routes have to be blocked, because on mobile they are two different mechanisms:
 *  - Android: the hardware back button/gesture -> BackHandler.
 *  - iOS + Android: the back swipe / header back button -> React Navigation's
 *    'beforeRemove' event.
 *
 * Forget either one and the user can still escape mid-payment.
 */
export function useBackHandlerGuard(enabled: boolean): void {
  const navigation = useNavigation();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const hardwareSub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true, // true = "I handled it", blocking the default behaviour
    );

    const navSub = navigation.addListener('beforeRemove', event => {
      event.preventDefault();
    });

    return () => {
      hardwareSub.remove();
      navSub();
    };
  }, [enabled, navigation]);
}
