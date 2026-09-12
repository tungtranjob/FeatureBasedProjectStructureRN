import React from 'react';
import {StyleSheet, View} from 'react-native';
import {spacing} from '../theme';
import {toUserMessage} from '../errors/app-error';
import {Button} from './Button';
import {Txt} from './Txt';

interface ErrorViewProps {
  error: unknown;
  onRetry?: () => void;
}

/**
 * Hiển thị lỗi thống nhất. Nhận `unknown` chứ không phải `Error` — vì
 * TanStack Query trả về `unknown`, và ép kiểu ở đây an toàn hơn ép ở
 * từng màn hình.
 */
export function ErrorView({error, onRetry}: ErrorViewProps) {
  return (
    <View style={styles.root}>
      <Txt style={styles.emoji}>😕</Txt>
      <Txt variant="bodyStrong" style={styles.message}>
        {toUserMessage(error)}
      </Txt>
      {!!onRetry && (
        <Button
          title="Thử lại"
          variant="secondary"
          onPress={onRetry}
          style={styles.retry}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emoji: {fontSize: 36, marginBottom: spacing.sm},
  message: {textAlign: 'center'},
  retry: {marginTop: spacing.lg},
});
