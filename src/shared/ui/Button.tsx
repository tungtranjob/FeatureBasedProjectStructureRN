import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {colors, radius, spacing} from '../theme';
import {Txt} from './Txt';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  testID,
}: ButtonProps) {
  // While loading we treat it as disabled too — blocks a double tap from sending two orders.
  const isDisabled = disabled || loading;
  const palette = VARIANTS[variant];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      style={({pressed}) => [
        styles.base,
        SIZES[size],
        {backgroundColor: palette.bg, borderColor: palette.border},
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={palette.text} size="small" />
      ) : (
        <View style={styles.content}>
          <Txt variant="bodyStrong" color={palette.text}>
            {title}
          </Txt>
        </View>
      )}
    </Pressable>
  );
}

const VARIANTS: Record<Variant, {bg: string; text: string; border: string}> = {
  primary: {bg: colors.primary, text: colors.textInverse, border: colors.primary},
  secondary: {bg: colors.surface, text: colors.text, border: colors.border},
  ghost: {bg: 'transparent', text: colors.primary, border: 'transparent'},
  danger: {bg: colors.danger, text: colors.textInverse, border: colors.danger},
};

const SIZES: Record<Size, ViewStyle> = {
  sm: {paddingVertical: spacing.sm, paddingHorizontal: spacing.md},
  md: {paddingVertical: spacing.md, paddingHorizontal: spacing.lg},
  lg: {paddingVertical: spacing.lg, paddingHorizontal: spacing.xl},
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  fullWidth: {alignSelf: 'stretch'},
  pressed: {opacity: 0.75},
  disabled: {opacity: 0.45},
});
