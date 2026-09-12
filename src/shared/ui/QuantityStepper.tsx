import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {colors, radius, spacing} from '../theme';
import {Txt} from './Txt';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  testID?: string;
}

/**
 * A controlled component: it keeps no state of its own.
 *
 * That is deliberate. Item quantity is DOMAIN state — it belongs to the cart
 * store, not to the component. If the component held its own state we would have
 * two sources of truth and they would drift apart.
 */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  testID,
}: QuantityStepperProps) {
  return (
    <View style={styles.root} testID={testID}>
      <StepButton
        label="−"
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
        testID={testID ? `${testID}-minus` : undefined}
      />
      <Txt variant="bodyStrong" style={styles.value}>
        {value}
      </Txt>
      <StepButton
        label="+"
        disabled={value >= max}
        onPress={() => onChange(value + 1)}
        testID={testID ? `${testID}-plus` : undefined}
      />
    </View>
  );
}

function StepButton({
  label,
  onPress,
  disabled,
  testID,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({pressed}) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}>
      <Txt variant="bodyStrong" color={disabled ? colors.textMuted : colors.primary}>
        {label}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {flexDirection: 'row', alignItems: 'center', gap: spacing.md},
  button: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  buttonDisabled: {backgroundColor: colors.surfaceAlt},
  buttonPressed: {opacity: 0.6},
  value: {minWidth: 20, textAlign: 'center'},
});
