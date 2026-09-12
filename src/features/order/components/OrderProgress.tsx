import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Txt} from '@shared/ui';
import {colors, spacing} from '@shared/theme';
import {
  getProgressIndex,
  ORDER_PROGRESS_STEPS,
  ORDER_STATUS_EMOJI,
  ORDER_STATUS_LABEL,
} from '../model/order-rules';
import type {OrderStatus} from '../model/types';

/**
 * Thanh tiến trình đơn hàng.
 *
 * Đơn bị huỷ được xử lý bằng một nhánh RIÊNG chứ không cố nhồi vào thanh
 * tiến trình. Cố vẽ "đã huỷ" thành bước thứ 5 sẽ ra một UI vô nghĩa —
 * huỷ không phải là tiến lên, nó là rẽ ra.
 */
export function OrderProgress({status}: {status: OrderStatus}) {
  if (status === 'CANCELLED') {
    return (
      <View style={styles.cancelled}>
        <Txt style={styles.cancelledEmoji}>❌</Txt>
        <Txt variant="bodyStrong" color={colors.danger}>
          Đơn hàng đã bị huỷ
        </Txt>
      </View>
    );
  }

  if (status === 'PENDING_PAYMENT') {
    return (
      <View style={styles.cancelled}>
        <Txt style={styles.cancelledEmoji}>⏳</Txt>
        <Txt variant="bodyStrong" color={colors.warning}>
          Đang chờ thanh toán
        </Txt>
      </View>
    );
  }

  const currentIndex = getProgressIndex(status);

  return (
    <View style={styles.root}>
      {ORDER_PROGRESS_STEPS.map((step, index) => {
        const done = index <= currentIndex;
        return (
          <View key={step} style={styles.step}>
            <View style={styles.markerRow}>
              {/* Đường nối bên trái, trừ bước đầu tiên */}
              {index > 0 && (
                <View style={[styles.line, done && styles.lineDone]} />
              )}
              <View style={[styles.dot, done && styles.dotDone]}>
                <Txt style={styles.dotEmoji}>
                  {done ? ORDER_STATUS_EMOJI[step] : ''}
                </Txt>
              </View>
              {index < ORDER_PROGRESS_STEPS.length - 1 && (
                <View
                  style={[styles.line, index < currentIndex && styles.lineDone]}
                />
              )}
            </View>
            <Txt
              variant="tiny"
              color={done ? colors.text : colors.textMuted}
              style={styles.label}>
              {ORDER_STATUS_LABEL[step]}
            </Txt>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flexDirection: 'row', paddingVertical: spacing.lg},
  step: {flex: 1, alignItems: 'center'},
  markerRow: {flexDirection: 'row', alignItems: 'center', width: '100%'},
  line: {flex: 1, height: 2, backgroundColor: colors.border},
  lineDone: {backgroundColor: colors.primary},
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {backgroundColor: colors.primarySoft, borderColor: colors.primary},
  dotEmoji: {fontSize: 13},
  label: {marginTop: spacing.xs, textAlign: 'center'},
  cancelled: {alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm},
  cancelledEmoji: {fontSize: 32},
});
