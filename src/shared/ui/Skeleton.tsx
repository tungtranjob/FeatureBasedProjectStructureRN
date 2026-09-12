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
 * Khung xương lúc đang tải.
 *
 * Dùng skeleton thay vì spinner toàn màn hình vì nó giữ nguyên bố cục —
 * nội dung thật hiện ra không làm layout nhảy, cảm giác nhanh hơn thật sự.
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
