import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Txt} from '@shared/ui';
import {colors, radius, spacing} from '@shared/theme';
import {formatPriceDelta} from '@shared/lib/format';
import type {MenuOptionGroup} from '../model/types';

interface OptionGroupPickerProps {
  group: MenuOptionGroup;
  selectedIds: string[];
  onToggle: (optionId: string) => void;
  errorMessage?: string;
}

export function OptionGroupPicker({
  group,
  selectedIds,
  onToggle,
  errorMessage,
}: OptionGroupPickerProps) {
  const isSingleChoice = group.maxSelect === 1;

  return (
    <View style={styles.group}>
      <View style={styles.header}>
        <Txt variant="bodyStrong">{group.name}</Txt>
        <Txt variant="tiny">
          {group.required ? 'Bắt buộc' : `Tối đa ${group.maxSelect}`}
        </Txt>
      </View>

      {!!errorMessage && (
        <Txt variant="caption" color={colors.danger}>
          {errorMessage}
        </Txt>
      )}

      {group.options.map(option => {
        const selected = selectedIds.includes(option.id);
        return (
          <Pressable
            key={option.id}
            onPress={() => onToggle(option.id)}
            testID={`option-${option.id}`}
            style={({pressed}) => [styles.option, pressed && styles.pressed]}>
            {/* Radio cho nhóm chọn-một, checkbox cho nhóm chọn-nhiều.
                Đây là quy ước quen thuộc — dùng sai khiến user tưởng chọn
                được nhiều trong khi thực tế chỉ được một. */}
            <View
              style={[
                styles.indicator,
                isSingleChoice ? styles.radio : styles.checkbox,
                selected && styles.indicatorSelected,
              ]}>
              {selected && (
                <Txt variant="tiny" color={colors.textInverse}>
                  ✓
                </Txt>
              )}
            </View>

            <Txt variant="body" style={styles.optionName}>
              {option.name}
            </Txt>
            <Txt variant="caption">{formatPriceDelta(option.priceDelta)}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  pressed: {opacity: 0.6},
  optionName: {flex: 1},
  indicator: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {borderRadius: 10},
  checkbox: {borderRadius: radius.sm},
  indicatorSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
