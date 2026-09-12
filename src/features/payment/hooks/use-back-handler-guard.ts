import {useEffect} from 'react';
import {BackHandler} from 'react-native';
import {useNavigation} from '@react-navigation/native';

/**
 * Chặn người dùng rời màn hình khi đang có thao tác không được ngắt quãng.
 *
 * Phải chặn CẢ HAI đường, vì trên mobile chúng là hai cơ chế khác nhau:
 *  - Android: nút Back cứng/gesture -> BackHandler.
 *  - iOS + Android: vuốt back / nút back trên header -> sự kiện
 *    'beforeRemove' của React Navigation.
 *
 * Quên một trong hai là người dùng vẫn thoát được giữa lúc thanh toán.
 */
export function useBackHandlerGuard(enabled: boolean): void {
  const navigation = useNavigation();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const hardwareSub = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true, // true = "tôi đã xử lý", chặn hành vi mặc định
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
