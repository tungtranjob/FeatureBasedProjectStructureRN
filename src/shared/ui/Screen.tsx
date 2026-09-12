import React from 'react';
import {StyleSheet, View, type StyleProp, type ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors} from '../theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Whether to reserve the bottom safe area. Turn off when the screen has a bottom-pinned bar. */
  edgeBottom?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** The standard frame for every screen: background colour + safe area. */
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
