import React, {useEffect, useRef} from 'react';
import {
  Animated,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {colors, radius} from '../theme';

interface SkeletonProps {
  width?: ViewStyle['width'];
  height?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Placeholder shown while loading.
 *
 * We use a skeleton instead of a full-screen spinner because it preserves the layout —
 * the real content appears without the layout jumping, which feels faster than it is.
 */
export function Skeleton({width = '100%', height = 16, style}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.block, {width, height, opacity}, style]}
      accessibilityElementsHidden
    />
  );
}

const styles = StyleSheet.create({
  block: {backgroundColor: colors.skeleton, borderRadius: radius.sm},
});
