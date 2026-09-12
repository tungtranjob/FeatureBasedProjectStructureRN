import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Txt} from '@shared/ui';
import {colors, spacing} from '@shared/theme';
import {logger} from '@core/logger/logger';

interface State {
  error: Error | null;
}

/**
 * Lưới an toàn cuối cùng.
 *
 * Không có nó, một lỗi chưa bắt trong bất kỳ component nào sẽ cho người
 * dùng một MÀN HÌNH TRẮNG, không nút bấm, không cách thoát — phải force
 * quit app. Với người dùng, đó gần như là app đã chết.
 *
 * Vẫn phải viết bằng class component: React chưa có bản hook tương đương.
 */
export class AppErrorBoundary extends React.Component<
  {children: React.ReactNode},
  State
> {
  state: State = {error: null};

  static getDerivedStateFromError(error: Error): State {
    return {error};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error('ErrorBoundary', error.message, info.componentStack);
    // Trong app thật: Sentry.captureException(error, {extra: info});
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.root}>
        <Txt style={styles.emoji}>💥</Txt>
        <Txt variant="h2">Ứng dụng gặp sự cố</Txt>
        <Txt variant="caption" style={styles.message}>
          {__DEV__ ? this.state.error.message : 'Vui lòng thử lại.'}
        </Txt>
        <Button
          title="Thử lại"
          onPress={() => this.setState({error: null})}
          style={styles.button}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emoji: {fontSize: 48, marginBottom: spacing.md},
  message: {textAlign: 'center', marginTop: spacing.sm},
  button: {marginTop: spacing.xl},
});
