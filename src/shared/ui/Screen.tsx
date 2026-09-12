import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Có chừa safe area dưới không. Tắt khi màn hình có thanh bar dính đáy. */
  edgeBottom?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Khung nền chuẩn cho mọi màn hình: màu nền + safe area. */
export function Screen({children, edgeBottom = true, style}: ScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        {paddingBottom: edgeBottom ? insets.bottom : 0},
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.background},
});
